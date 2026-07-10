import "server-only";

import {
  detectItiDocumentType,
  getDocumentTextChunk,
  parseUploadedBlobDocuments,
} from "@/services/iti/document-parser";
import { logItiDev } from "@/services/iti/dev-logger";
import { getItiProviderName, runItiExtraction } from "@/services/iti/provider";
import type {
  ItiBlobFileInput,
  ItiProcessedFileResult,
  ItiUploadedDocumentMeta,
  RunItiExtractionResponse,
} from "@/services/iti/types";
import { validateBlobPathname, validateBlobUrl } from "@/services/iti/blob-security";
import { ITI_MAX_FILE_SIZE_BYTES, ITI_MAX_TOTAL_SIZE_BYTES } from "@/services/iti/constants";
import { isItiSupportedFile } from "@/services/iti/upload-validation";
import { createAiExtractionRecord } from "@/services/ai-extractions/mutations";
import { createDocumentRecord } from "@/services/documents/mutations";

function toProcessedFile(
  file: ItiBlobFileInput,
  status: ItiProcessedFileResult["status"],
  error?: string,
  documentId?: string,
  documentType?: ItiProcessedFileResult["documentType"],
  confidenceScore?: number,
): ItiProcessedFileResult {
  return {
    fileName: file.name,
    fileType: file.mimeType,
    fileSize: file.size,
    status,
    error,
    documentId,
    documentType,
    confidenceScore,
    blobUrl: file.url,
    blobPathname: file.pathname,
  };
}

export async function extractItiFromBlobFiles(input: {
  importSessionId: string;
  files: ItiBlobFileInput[];
}): Promise<RunItiExtractionResponse> {
  const provider = getItiProviderName() === "openai" ? "openai" : "mock";

  try {
    const { importSessionId, files } = input;

    logItiDev({
      fileCount: files.length,
      fileNames: files.map((file) => file.name),
      fileTypes: files.map((file) => file.mimeType),
      fileSizes: files.map((file) => file.size),
      provider,
      status: "started",
    });

    if (!importSessionId?.trim()) {
      return { ok: false, error: "Import session is missing.", provider };
    }

    if (!files.length) {
      return {
        ok: false,
        error: "Add at least one uploaded document before running ITI.",
        provider,
      };
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > ITI_MAX_TOTAL_SIZE_BYTES) {
      return {
        ok: false,
        error: `Total upload size exceeds the ${Math.floor(ITI_MAX_TOTAL_SIZE_BYTES / (1024 * 1024))} MB limit.`,
        provider,
      };
    }

    const processedFiles: ItiProcessedFileResult[] = [];
    const validFiles: ItiBlobFileInput[] = [];

    for (const file of files) {
      const validation = isItiSupportedFile({
        name: file.name,
        type: file.mimeType,
        size: file.size,
      });

      if (!validation.ok) {
        processedFiles.push(toProcessedFile(file, "failed", validation.error));
        continue;
      }

      if (file.size > ITI_MAX_FILE_SIZE_BYTES) {
        processedFiles.push(
          toProcessedFile(
            file,
            "failed",
            `File exceeds the ${Math.floor(ITI_MAX_FILE_SIZE_BYTES / (1024 * 1024))} MB limit.`,
          ),
        );
        continue;
      }

      const urlValidation = validateBlobUrl(file.url);
      if (!urlValidation.ok) {
        processedFiles.push(toProcessedFile(file, "failed", urlValidation.error));
        continue;
      }

      const pathnameValidation = validateBlobPathname(file.pathname, importSessionId);
      if (!pathnameValidation.ok) {
        processedFiles.push(toProcessedFile(file, "failed", pathnameValidation.error));
        continue;
      }

      validFiles.push(file);
    }

    if (!validFiles.length) {
      return {
        ok: false,
        error: "No valid uploaded documents were provided.",
        files: processedFiles,
        provider,
      };
    }

    const storedDocuments: ItiUploadedDocumentMeta[] = [];
    const documentIds: string[] = [];

    for (const file of validFiles) {
      try {
        const documentType = detectItiDocumentType(file.name);
        const record = await createDocumentRecord({
          importSessionId,
          fileName: file.name,
          fileType: file.mimeType,
          fileSize: file.size,
          storagePath: file.pathname,
          blobUrl: file.url,
          blobPathname: file.pathname,
          documentType,
          processingStatus: "temporary",
        });

        documentIds.push(record.id);
        storedDocuments.push({
          id: record.id,
          fileName: file.name,
          fileType: file.mimeType,
          fileSize: file.size,
          documentType,
          storagePath: file.pathname,
          blobUrl: file.url,
          blobPathname: file.pathname,
          importSessionId,
        });

        processedFiles.push(
          toProcessedFile(file, "processing", undefined, record.id, documentType),
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not create a document record for this file.";

        processedFiles.push(toProcessedFile(file, "failed", message));
      }
    }

    if (!storedDocuments.length) {
      return {
        ok: false,
        error: "Could not register uploaded documents for extraction.",
        files: processedFiles,
        provider,
      };
    }

    let documentText = "";
    try {
      documentText = await parseUploadedBlobDocuments(
        storedDocuments.map((doc) => ({
          fileName: doc.fileName,
          fileType: doc.fileType,
          fileSize: doc.fileSize,
          blobUrl: doc.blobUrl,
        })),
      );
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

    const pdfWithoutText = storedDocuments.filter((doc) => {
      const isPdf =
        doc.fileType === "application/pdf" || doc.fileName.toLowerCase().endsWith(".pdf");

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

    const extractedDocByName = new Map(
      extraction.documents.map((doc) => [doc.fileName, doc]),
    );

    const successFiles = processedFiles.map((file) => {
      if (file.status === "failed") {
        return file;
      }

      const extracted = extractedDocByName.get(file.fileName);
      const isUnknown = extracted?.documentType === "other";

      return {
        ...file,
        documentType: extracted?.documentType ?? file.documentType,
        confidenceScore: extracted?.confidenceScore,
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
      warning: warning ?? null,
      provider,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "ITI extraction failed unexpectedly. Try again or continue manually.";

    logItiDev({
      fileCount: input.files.length,
      fileNames: input.files.map((file) => file.name),
      fileTypes: input.files.map((file) => file.mimeType),
      fileSizes: input.files.map((file) => file.size),
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
