import "server-only";

import { detectItiDocumentType } from "@/services/iti/document-parser";
import { logItiDev } from "@/services/iti/dev-logger";
import { extractItiPackageWithOpenAi } from "@/services/iti/openai/extract-package";
import { getItiProviderName } from "@/services/iti/provider";
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
  options?: {
    error?: string;
    documentId?: string;
    documentType?: ItiProcessedFileResult["documentType"];
    confidenceScore?: number;
    processingMethod?: ItiProcessedFileResult["processingMethod"];
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
          toProcessedFile(file, "fetching_document", {
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

    const packageResult = await extractItiPackageWithOpenAi({
      documents: storedDocuments,
      useMock: provider === "mock",
    });

    const outcomeByName = new Map(
      packageResult.outcomes.map((outcome) => [outcome.fileName, outcome]),
    );

    const filesAfterProcessing = processedFiles.map((file) => {
      if (file.status === "failed") {
        return file;
      }

      const outcome = outcomeByName.get(file.fileName);
      if (!outcome) {
        return file;
      }

      if (outcome.error) {
        return {
          ...file,
          status: "failed" as const,
          error: outcome.error,
          warnings: outcome.warnings,
        };
      }

      return {
        ...file,
        status: outcome.status,
        processingMethod: outcome.processingMethod,
        pageCount: outcome.pageCount,
        warnings: outcome.warnings,
        confidenceScore: outcome.confidenceScore,
        documentType: outcome.extraction?.documentType ?? file.documentType,
      };
    });

    if (!packageResult.ok) {
      return {
        ok: false,
        error: packageResult.error,
        files: filesAfterProcessing,
        provider,
      };
    }

    const successfulDocuments = storedDocuments.filter((doc) =>
      packageResult.outcomes.some(
        (outcome) => outcome.fileName === doc.fileName && outcome.extraction,
      ),
    );

    const extractionRecord = await createAiExtractionRecord({
      sourceDocumentIds: successfulDocuments.map((doc) => doc.id),
      extractedJson: packageResult.rawJson,
      confidenceScore: packageResult.extraction.overallConfidence,
    });

    const failedCount = packageResult.outcomes.filter((outcome) => outcome.error).length;
    const warning =
      provider === "mock"
        ? "OPENAI_API_KEY is not configured. ITI used mock extraction data for review."
        : failedCount > 0
          ? `${failedCount} file(s) could not be analyzed. ITI continued with the remaining documents.`
          : packageResult.conflicts.length > 0
            ? `${packageResult.conflicts.length} field conflict(s) were detected across uploaded documents. Review the merged values carefully.`
            : undefined;

    const successFiles = filesAfterProcessing.map((file) => {
      if (file.status === "failed") {
        return file;
      }

      const outcome = outcomeByName.get(file.fileName);
      const isUnknown = outcome?.extraction?.documentType === "other";

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
      documentIds: successfulDocuments.map((doc) => doc.id),
      extraction: packageResult.extraction,
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
