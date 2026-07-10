import "server-only";

import OpenAI from "openai";

import { fetchBlobDocumentBuffer } from "@/services/iti/blob-fetch";
import { analyzeImageFile } from "@/services/iti/openai/analyze-image";
import { analyzePdfWithOpenAIFile } from "@/services/iti/openai/analyze-pdf-with-openai-file";
import { consolidateDocumentExtractions } from "@/services/iti/openai/consolidate";
import { getItiOpenAiModel, validateOpenAiFileSize } from "@/services/iti/openai/config";
import { logItiOpenAiDiagnostic } from "@/services/iti/openai/diagnostics";
import { ItiOpenAiError } from "@/services/iti/openai/errors";
import {
  buildMockDocumentExtraction,
  normalizeDocumentExtraction,
  type ItiPerDocumentExtraction,
} from "@/services/iti/openai/normalize";
import { sanitizeItiUserErrorMessage } from "@/services/iti/openai/sanitize-error";
import type {
  ItiDocumentProcessingMethod,
  ItiPipelineDiagnostic,
  ItiProcessedFileStatus,
  ItiUploadedDocumentMeta,
} from "@/services/iti/types";

export type ItiDocumentProcessingStage =
  | "fetching_document"
  | "sending_to_iti"
  | "analyzing_pdf"
  | "extracting_transaction_data"
  | "review_ready"
  | "failed";

export type ItiDocumentProcessingOutcome = {
  fileName: string;
  stage: ItiDocumentProcessingStage;
  status: ItiProcessedFileStatus;
  processingMethod?: ItiDocumentProcessingMethod;
  pageCount?: number;
  warnings: string[];
  confidenceScore?: number;
  error?: string;
  extraction?: ItiPerDocumentExtraction;
};

function getExtension(fileName: string) {
  const lower = fileName.toLowerCase();
  const dotIndex = lower.lastIndexOf(".");
  return dotIndex >= 0 ? lower.slice(dotIndex) : "";
}

function isHeicLike(fileName: string, fileType: string) {
  const extension = getExtension(fileName);
  return (
    extension === ".heic" ||
    extension === ".heif" ||
    fileType === "image/heic" ||
    fileType === "image/heif"
  );
}

function isPdf(fileName: string, fileType: string) {
  return fileType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");
}

function isImage(fileName: string, fileType: string) {
  if (fileType.startsWith("image/")) {
    return true;
  }

  const extension = getExtension(fileName);
  return extension === ".jpg" || extension === ".jpeg" || extension === ".png";
}

function getOpenAiClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new ItiOpenAiError(
      "responses_api_failed",
      "OPENAI_API_KEY is not configured for ITI document analysis.",
    );
  }

  return new OpenAI({ apiKey });
}

export async function extractDocumentWithOpenAi(
  document: ItiUploadedDocumentMeta,
  options?: { useMock?: boolean },
): Promise<ItiDocumentProcessingOutcome> {
  const warnings: string[] = [];

  if (isHeicLike(document.fileName, document.fileType)) {
    return {
      fileName: document.fileName,
      stage: "failed",
      status: "failed",
      warnings,
      error:
        "HEIC/HEIF images are not supported for ITI analysis yet. Convert to JPEG or PNG and re-upload.",
    };
  }

  const sizeValidation = validateOpenAiFileSize(document.fileSize, document.fileName);
  if (!sizeValidation.ok) {
    return {
      fileName: document.fileName,
      stage: "failed",
      status: "failed",
      warnings,
      error: sizeValidation.error,
    };
  }

  if (options?.useMock) {
    const extraction = buildMockDocumentExtraction(document);
    return {
      fileName: document.fileName,
      stage: "review_ready",
      status: "review_suggested",
      processingMethod: "openai_file",
      pageCount: 1,
      warnings: ["ITI used mock extraction data for review."],
      confidenceScore: extraction.confidenceScore,
      extraction,
    };
  }

  logItiOpenAiDiagnostic({
    stage: "blob_fetch_started",
    importSessionId: document.importSessionId,
    fileName: document.fileName,
    mimeType: document.fileType,
    fileSize: document.fileSize,
    model: getItiOpenAiModel(),
    pipeline: "openai_file",
    provider: "openai",
  });

  let buffer: Buffer;
  try {
    const fetched = await fetchBlobDocumentBuffer(document.blobUrl, document.fileSize);
    buffer = fetched.buffer;
    logItiOpenAiDiagnostic({
      stage: "blob_fetch_succeeded",
      importSessionId: document.importSessionId,
      fileName: document.fileName,
      mimeType: document.fileType,
      fileSize: document.fileSize,
      downloadedSize: buffer.byteLength,
      model: getItiOpenAiModel(),
      pipeline: "openai_file",
      provider: "openai",
    });
  } catch (error) {
    const message = sanitizeItiUserErrorMessage(
      new ItiOpenAiError(
        "blob_fetch_failed",
        error instanceof Error ? error.message : "Blob fetch failed.",
      ),
      document.fileName,
    );

    logItiOpenAiDiagnostic({
      stage: "blob_fetch_failed",
      importSessionId: document.importSessionId,
      fileName: document.fileName,
      mimeType: document.fileType,
      fileSize: document.fileSize,
      errorMessage: message,
      pipeline: "openai_file",
      provider: "openai",
    });

    return {
      fileName: document.fileName,
      stage: "failed",
      status: "failed",
      warnings,
      error: message,
    };
  }

  const client = getOpenAiClient();

  try {
    if (isImage(document.fileName, document.fileType)) {
      const mimeType =
        document.fileType === "image/png" || document.fileName.toLowerCase().endsWith(".png")
          ? "image/png"
          : "image/jpeg";

      const { extraction: raw } = await analyzeImageFile({
        client,
        buffer,
        fileName: document.fileName,
        mimeType,
        importSessionId: document.importSessionId,
      });

      const extraction = normalizeDocumentExtraction({
        fileName: document.fileName,
        raw,
        processingMethod: "openai_image",
      });

      logItiOpenAiDiagnostic({
        stage: "file_completed",
        importSessionId: document.importSessionId,
        fileName: document.fileName,
        pipeline: "openai_file",
        provider: "openai",
      });

      return {
        fileName: document.fileName,
        stage: "review_ready",
        status: "review_suggested",
        processingMethod: "openai_image",
        pageCount: 1,
        warnings,
        confidenceScore: extraction.confidenceScore,
        extraction,
      };
    }

    if (isPdf(document.fileName, document.fileType)) {
      const raw = await analyzePdfWithOpenAIFile({
        client,
        buffer,
        fileName: document.fileName,
        mimeType: document.fileType,
        importSessionId: document.importSessionId,
        declaredSize: document.fileSize,
      });

      const extraction = normalizeDocumentExtraction({
        fileName: document.fileName,
        raw,
        processingMethod: "openai_file",
      });

      logItiOpenAiDiagnostic({
        stage: "file_completed",
        importSessionId: document.importSessionId,
        fileName: document.fileName,
        pipeline: "openai_file",
        provider: "openai",
      });

      return {
        fileName: document.fileName,
        stage: "review_ready",
        status: "review_suggested",
        processingMethod: "openai_file",
        pageCount: raw.document.pageReferences.length || undefined,
        warnings,
        confidenceScore: extraction.confidenceScore,
        extraction,
      };
    }

    return {
      fileName: document.fileName,
      stage: "failed",
      status: "failed",
      warnings,
      error: "Unsupported document type for ITI OpenAI processing.",
    };
  } catch (error) {
    const message = sanitizeItiUserErrorMessage(error, document.fileName);

    logItiOpenAiDiagnostic({
      stage: "file_failed",
      importSessionId: document.importSessionId,
      fileName: document.fileName,
      mimeType: document.fileType,
      fileSize: document.fileSize,
      errorMessage: message,
      errorClass: error instanceof Error ? error.name : "Error",
      pipeline: "openai_file",
      provider: "openai",
    });

    return {
      fileName: document.fileName,
      stage: "failed",
      status: "failed",
      warnings,
      error: message,
    };
  }
}

export async function extractItiPackageWithOpenAi(input: {
  documents: ItiUploadedDocumentMeta[];
  useMock?: boolean;
}) {
  const outcomes: ItiDocumentProcessingOutcome[] = [];

  for (const document of input.documents) {
    outcomes.push(
      await extractDocumentWithOpenAi(document, {
        useMock: input.useMock,
      }),
    );
  }

  const successful = outcomes.filter((outcome) => outcome.extraction);
  const pipeline: ItiPipelineDiagnostic = {
    pipeline: "openai_file",
    provider: input.useMock ? "mock" : "openai",
    model: getItiOpenAiModel(),
    fileCount: input.documents.length,
    successfulFileCount: successful.length,
    failedFileCount: outcomes.length - successful.length,
  };

  if (!successful.length) {
    const firstError = outcomes.find((outcome) => outcome.error)?.error;
    return {
      ok: false as const,
      error: firstError ?? "No documents were successfully analyzed by ITI.",
      outcomes,
      pipeline,
    };
  }

  logItiOpenAiDiagnostic({
    stage: "package_consolidation_started",
    pipeline: pipeline.pipeline,
    provider: pipeline.provider,
    model: pipeline.model,
  });

  const { extraction, conflicts } = consolidateDocumentExtractions(
    successful.map((outcome) => outcome.extraction as ItiPerDocumentExtraction),
  );

  if (conflicts.length) {
    extraction.transaction.specialTerms = {
      value: [
        extraction.transaction.specialTerms.value,
        `${conflicts.length} field conflict(s) detected across uploaded documents.`,
      ]
        .filter(Boolean)
        .join(" "),
      confidence: "medium",
    };
  }

  logItiOpenAiDiagnostic({
    stage: "package_consolidation_succeeded",
    pipeline: pipeline.pipeline,
    provider: pipeline.provider,
    model: pipeline.model,
  });

  return {
    ok: true as const,
    extraction,
    rawJson: JSON.stringify(extraction),
    outcomes,
    conflicts,
    pipeline,
  };
}
