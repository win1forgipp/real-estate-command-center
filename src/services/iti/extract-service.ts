import "server-only";

import { detectItiDocumentType } from "@/services/iti/document-parser";
import { processUploadedBlobDocuments } from "@/services/iti/document-processing/process-document";
import { logItiDev } from "@/services/iti/dev-logger";
import { getItiProviderName, runItiExtraction } from "@/services/iti/provider";
import type {
  ItiBlobFileInput,
  ItiDocumentProcessingMethod,
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
  options?: {
    error?: string;
    documentId?: string;
    documentType?: ItiProcessedFileResult["documentType"];
    confidenceScore?: number;
    processingMethod?: ItiDocumentProcessingMethod;
    pageCount?: number;
    warnings?: string[];
  },
): ItiProcessedFileResult {
  return {
    fileName: file.name,
    fileType: file.mimeType,
    fileSize: file.size,
    status,
    error: options?.error,
    documentId: options?.documentId,
    documentType: options?.documentType,
    confidenceScore: options?.confidenceScore,
    processingMethod: options?.processingMethod,
    pageCount: options?.pageCount,
    warnings: options?.warnings,
    blobUrl: file.url,
    blobPathname: file.pathname,
  };
}

function processingStatusForMethod(method: ItiDocumentProcessingMethod): ItiProcessedFileResult["status"] {
  if (method === "embedded_text") {
    return "parsed_successfully";
  }

  if (method === "ocr") {
    return "running_ocr";
  }

  return "analyzing_scanned_document";
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
        processedFiles.push(toProcessedFile(file, "failed", { error: validation.error }));
        continue;
      }

      if (file.size > ITI_MAX_FILE_SIZE_BYTES) {
        processedFiles.push(
          toProcessedFile(file, "failed", {
            error: `File exceeds the ${Math.floor(ITI_MAX_FILE_SIZE_BYTES / (1024 * 1024))} MB limit.`,
          }),
        );
        continue;
      }

      const urlValidation = validateBlobUrl(file.url);
      if (!urlValidation.ok) {
        processedFiles.push(toProcessedFile(file, "failed", { error: urlValidation.error }));
        continue;
      }

      const pathnameValidation = validateBlobPathname(file.pathname, importSessionId);
      if (!pathnameValidation.ok) {
        processedFiles.push(toProcessedFile(file, "failed", { error: pathnameValidation.error }));
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
          toProcessedFile(file, "reading_embedded_text", {
            documentId: record.id,
            documentType,
          }),
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not create a document record for this file.";

        processedFiles.push(toProcessedFile(file, "failed", { error: message }));
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

    const { documentText, results, failures } = await processUploadedBlobDocuments(
      storedDocuments.map((doc) => ({
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        blobUrl: doc.blobUrl,
      })),
      { useMock: provider === "mock" },
    );

    const resultByName = new Map(results.map((result) => [result.fileName, result]));
    const failureByName = new Map(failures.map((failure) => [failure.fileName, failure.error]));

    const filesAfterProcessing = processedFiles.map((file) => {
      if (file.status === "failed") {
        return file;
      }

      const failure = failureByName.get(file.fileName);
      if (failure) {
        return {
          ...file,
          status: "failed" as const,
          error: failure,
        };
      }

      const processingResult = resultByName.get(file.fileName);
      if (!processingResult) {
        return file;
      }

      return {
        ...file,
        status: processingStatusForMethod(processingResult.method),
        processingMethod: processingResult.method,
        pageCount: processingResult.pageCount,
        warnings: processingResult.warnings,
        confidenceScore: processingResult.confidence,
      };
    });

    if (!results.length) {
      return {
        ok: false,
        error:
          "ITI could not read any uploaded documents after both text extraction and scanned-document analysis.",
        files: filesAfterProcessing,
        provider,
      };
    }

    const successfulDocuments = storedDocuments.filter((doc) => resultByName.has(doc.fileName));

    const { extraction, rawJson } = await runItiExtraction({
      documents: successfulDocuments,
      documentText,
      useMock: provider === "mock",
    });

    const extractionRecord = await createAiExtractionRecord({
      sourceDocumentIds: successfulDocuments.map((doc) => doc.id),
      extractedJson: rawJson,
      confidenceScore: extraction.overallConfidence,
    });

    const warning =
      provider === "mock"
        ? extraction.setupMessage ??
          "OPENAI_API_KEY is not configured. ITI used mock extraction data for review."
        : failures.length
          ? `${failures.length} file(s) could not be read. ITI continued with the remaining documents.`
          : undefined;

    const extractedDocByName = new Map(
      extraction.documents.map((doc) => [doc.fileName, doc]),
    );

    const successFiles = filesAfterProcessing.map((file) => {
      if (file.status === "failed") {
        return file;
      }

      const extracted = extractedDocByName.get(file.fileName);
      const isUnknown = extracted?.documentType === "other";

      return {
        ...file,
        documentType: extracted?.documentType ?? file.documentType,
        confidenceScore: extracted?.confidenceScore ?? file.confidenceScore,
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
      documentIds: successfulDocuments.map((doc) => doc.id),
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
