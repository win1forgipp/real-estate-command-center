"use server";

import {
  detectItiDocumentType,
  getItiProviderName,
  parseUploadedDocuments,
  runItiExtraction,
} from "@/services/iti";
import { logItiDev } from "@/services/iti/dev-logger";
import type {
  ItiProcessedFileResult,
  ItiUploadedDocumentMeta,
  RunItiExtractionResponse,
} from "@/services/iti/types";
import { isItiSupportedFile } from "@/services/iti/upload-validation";
import { createAiExtractionRecord } from "@/services/ai-extractions/mutations";
import { createDocumentRecord } from "@/services/documents/mutations";
import { storeUploadedFile } from "@/services/document-storage";

function toProcessedFile(
  file: File,
  status: ItiProcessedFileResult["status"],
  error?: string,
  documentId?: string,
): ItiProcessedFileResult {
  return {
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
    fileSize: file.size,
    status,
    error,
    documentId,
  };
}

function getDocumentTextChunk(documentText: string, fileName: string) {
  const marker = `--- ${fileName} ---`;
  if (!documentText.includes(marker)) {
    return "";
  }

  return documentText.split(marker)[1]?.split("\n--- ")[0]?.trim() ?? "";
}

export async function runItiExtractionAction(
  formData: FormData,
): Promise<RunItiExtractionResponse> {
  const provider = getItiProviderName() === "openai" ? "openai" : "mock";

  try {
    const uploadedFiles = formData
      .getAll("documents")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    logItiDev({
      fileCount: uploadedFiles.length,
      fileNames: uploadedFiles.map((file) => file.name),
      fileTypes: uploadedFiles.map((file) => file.type || "unknown"),
      fileSizes: uploadedFiles.map((file) => file.size),
      provider,
      status: "started",
    });

    if (!uploadedFiles.length) {
      return {
        ok: false,
        error: "Add at least one document to run ITI.",
        provider,
      };
    }

    const processedFiles: ItiProcessedFileResult[] = [];
    const validFiles: File[] = [];

    for (const file of uploadedFiles) {
      const validation = isItiSupportedFile(file);
      if (!validation.ok) {
        processedFiles.push(toProcessedFile(file, "failed", validation.error));
        continue;
      }
      validFiles.push(file);
    }

    if (!validFiles.length) {
      return {
        ok: false,
        error: "No supported documents found. Upload PDFs or images only.",
        files: processedFiles,
        provider,
      };
    }

    const storedDocuments: ItiUploadedDocumentMeta[] = [];
    const documentIds: string[] = [];

    for (const file of validFiles) {
      try {
        const documentType = detectItiDocumentType(file.name);
        const stored = await storeUploadedFile(file, documentType);
        const record = await createDocumentRecord({
          fileName: stored.fileName,
          fileType: stored.fileType,
          fileSize: stored.fileSize,
          storagePath: stored.storagePath,
          documentType,
        });

        documentIds.push(record.id);
        storedDocuments.push({
          id: record.id,
          fileName: stored.fileName,
          fileType: stored.fileType,
          fileSize: stored.fileSize,
          documentType,
          storagePath: stored.storagePath,
        });

        processedFiles.push(toProcessedFile(file, "processing", undefined, record.id));
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not store this file for processing.";

        processedFiles.push(toProcessedFile(file, "failed", message));
      }
    }

    logItiDev({
      fileCount: validFiles.length,
      fileNames: storedDocuments.map((doc) => doc.fileName),
      fileTypes: storedDocuments.map((doc) => doc.fileType),
      fileSizes: storedDocuments.map((doc) => doc.fileSize),
      provider,
      status: "stored",
    });

    if (!storedDocuments.length) {
      return {
        ok: false,
        error: "Could not store uploaded files. Check file permissions and try again.",
        files: processedFiles,
        provider,
      };
    }

    let documentText = "";
    try {
      documentText = await parseUploadedDocuments(storedDocuments);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not read text from the uploaded documents.";

      return {
        ok: false,
        error: message,
        files: processedFiles.map((file) =>
          file.status === "processing"
            ? { ...file, status: "failed" as const, error: message }
            : file,
        ),
        provider,
      };
    }

    logItiDev({
      fileCount: storedDocuments.length,
      fileNames: storedDocuments.map((doc) => doc.fileName),
      fileTypes: storedDocuments.map((doc) => doc.fileType),
      fileSizes: storedDocuments.map((doc) => doc.fileSize),
      provider,
      status: "parsed",
    });

    const pdfWithoutText = storedDocuments.filter((doc) => {
      const isPdf =
        doc.fileType === "application/pdf" ||
        doc.fileName.toLowerCase().endsWith(".pdf");

      if (!isPdf) {
        return false;
      }

      return getDocumentTextChunk(documentText, doc.fileName).length === 0;
    });

    if (provider === "openai" && pdfWithoutText.length === storedDocuments.length) {
      return {
        ok: false,
        error:
          "Could not extract readable text from the uploaded PDFs. Try a text-based PDF or continue manually.",
        files: processedFiles.map((file) =>
          file.status === "processing"
            ? {
                ...file,
                status: "failed" as const,
                error: "No readable text extracted from this PDF.",
              }
            : file,
        ),
        provider,
      };
    }

    const { extraction, rawJson } = await runItiExtraction({
      documents: storedDocuments,
      documentText,
      useMock: provider === "mock",
    });

    logItiDev({
      fileCount: storedDocuments.length,
      fileNames: storedDocuments.map((doc) => doc.fileName),
      fileTypes: storedDocuments.map((doc) => doc.fileType),
      fileSizes: storedDocuments.map((doc) => doc.fileSize),
      provider,
      status: "extracted",
    });

    const extractionRecord = await createAiExtractionRecord({
      sourceDocumentIds: documentIds,
      extractedJson: rawJson,
      confidenceScore: extraction.overallConfidence,
    });

    const warning =
      provider === "mock"
        ? extraction.setupMessage ??
          "OPENAI_API_KEY is not configured. ITI used mock extraction data for review."
        : undefined;

    const successFiles = processedFiles.map((file) => {
      if (file.status === "failed") {
        return file;
      }

      const matchedDoc = storedDocuments.find((doc) => doc.fileName === file.fileName);
      const isUnknown =
        matchedDoc &&
        matchedDoc.documentType === "other" &&
        !matchedDoc.fileName.toLowerCase().includes("support");

      return {
        ...file,
        status: isUnknown ? ("unknown_document" as const) : ("review_suggested" as const),
      };
    });

    logItiDev({
      fileCount: storedDocuments.length,
      fileNames: storedDocuments.map((doc) => doc.fileName),
      fileTypes: storedDocuments.map((doc) => doc.fileType),
      fileSizes: storedDocuments.map((doc) => doc.fileSize),
      provider,
      status: "completed",
    });

    return {
      ok: true,
      extractionId: extractionRecord.id,
      documentIds,
      extraction,
      files: successFiles,
      warning,
      provider,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "ITI extraction failed unexpectedly. Try again or continue manually.";

    logItiDev({
      fileCount: 0,
      fileNames: [],
      fileTypes: [],
      fileSizes: [],
      provider,
      status: "failed",
      error: message,
    });

    return {
      ok: false,
      error: message,
      provider,
    };
  }
}

/** @deprecated Use runItiExtractionAction */
export const extractTransactionDocumentsAction = runItiExtractionAction;
