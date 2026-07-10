import "server-only";

import OpenAI from "openai";

import { fetchBlobDocumentBuffer } from "@/services/iti/blob-fetch";
import { assessTextQuality } from "@/services/iti/document-processing/assess-text-quality";
import { extractPdfEmbeddedText } from "@/services/iti/document-processing/extract-pdf-text";
import { processDocument } from "@/services/iti/document-processing/process-document";
import { analyzeImageFile } from "@/services/iti/openai/analyze-image";
import { analyzePdfFile } from "@/services/iti/openai/analyze-pdf-file";
import { consolidateDocumentExtractions } from "@/services/iti/openai/consolidate";
import {
  getItiOpenAiModel,
  getItiPdfProcessingMode,
  validateOpenAiFileSize,
} from "@/services/iti/openai/config";
import { logItiOpenAiDiagnostic } from "@/services/iti/openai/diagnostics";
import { ItiOpenAiError } from "@/services/iti/openai/errors";
import {
  buildMockDocumentExtraction,
  normalizeDocumentExtraction,
  type ItiPerDocumentExtraction,
} from "@/services/iti/openai/normalize";
import { deleteOpenAiFiles } from "@/services/iti/openai/upload-file";
import type {
  ItiDocumentProcessingMethod,
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

async function processLegacyRenderedDocument(input: {
  document: ItiUploadedDocumentMeta;
  buffer: Buffer;
}) {
  const result = await processDocument({
    fileName: input.document.fileName,
    fileType: input.document.fileType,
    buffer: input.buffer,
    useMock: false,
  });

  return {
    stage: "extracting_transaction_data" as const,
    status: "parsed_successfully" as const,
    processingMethod: result.method,
    pageCount: result.pageCount,
    warnings: result.warnings,
    confidenceScore: result.confidence,
    documentText: result.text,
  };
}

export async function extractDocumentWithOpenAi(
  document: ItiUploadedDocumentMeta,
  options?: { useMock?: boolean },
): Promise<ItiDocumentProcessingOutcome> {
  const warnings: string[] = [];
  const mode = getItiPdfProcessingMode();

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
      warnings,
      confidenceScore: extraction.confidenceScore,
      extraction,
    };
  }

  logItiOpenAiDiagnostic({
    stage: "blob_fetch_started",
    fileName: document.fileName,
    mimeType: document.fileType,
    fileSize: document.fileSize,
    model: getItiOpenAiModel(),
  });

  let buffer: Buffer;
  try {
    const fetched = await fetchBlobDocumentBuffer(document.blobUrl, document.fileSize);
    buffer = fetched.buffer;
    logItiOpenAiDiagnostic({
      stage: "blob_fetch_succeeded",
      fileName: document.fileName,
      mimeType: document.fileType,
      fileSize: document.fileSize,
      model: getItiOpenAiModel(),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not fetch the uploaded document from secure storage.";

    logItiOpenAiDiagnostic({
      stage: "blob_fetch_failed",
      fileName: document.fileName,
      mimeType: document.fileType,
      fileSize: document.fileSize,
      errorMessage: message,
    });

    return {
      fileName: document.fileName,
      stage: "failed",
      status: "failed",
      warnings,
      error: `Blob fetch failure: ${message}`,
    };
  }

  if (mode === "legacy_render") {
    try {
      const legacy = await processLegacyRenderedDocument({ document, buffer });
      warnings.push(...legacy.warnings, "Processed with legacy_render mode.");
      return {
        fileName: document.fileName,
        stage: legacy.stage,
        status: legacy.status,
        processingMethod: legacy.processingMethod,
        pageCount: legacy.pageCount,
        warnings,
        confidenceScore: legacy.confidenceScore,
        error: "Legacy render mode produced text only. Switch to openai_file for structured extraction.",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Legacy PDF rendering failed.";
      return {
        fileName: document.fileName,
        stage: "failed",
        status: "failed",
        warnings,
        error: message,
      };
    }
  }

  const client = getOpenAiClient();
  const openAiFileIds: string[] = [];

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
      });

      const extraction = normalizeDocumentExtraction({
        fileName: document.fileName,
        raw,
        processingMethod: "openai_image",
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
      const embedded = await extractPdfEmbeddedText(buffer);
      const embeddedIsUsable = assessTextQuality(embedded.text).isUsable;
      let embeddedText: string | undefined;

      if (mode === "embedded_text_only") {
        if (!embeddedIsUsable) {
          return {
            fileName: document.fileName,
            stage: "failed",
            status: "failed",
            warnings,
            error:
              "Embedded PDF text was insufficient and ITI_PDF_PROCESSING_MODE is embedded_text_only.",
          };
        }

        embeddedText = embedded.text;
      } else if (embeddedIsUsable) {
        embeddedText = embedded.text;
        warnings.push("Used embedded PDF text fast-path before OpenAI structured extraction.");
      }

      const { extraction: raw, openAiFileId } = await analyzePdfFile({
        client,
        buffer,
        fileName: document.fileName,
        mimeType: document.fileType,
        embeddedText,
      });

      if (openAiFileId) {
        openAiFileIds.push(openAiFileId);
      }

      const extraction = normalizeDocumentExtraction({
        fileName: document.fileName,
        raw,
        processingMethod: openAiFileId ? "openai_file" : "embedded_text",
      });

      return {
        fileName: document.fileName,
        stage: "review_ready",
        status: "review_suggested",
        processingMethod: extraction.processingMethod,
        pageCount: raw.document?.pageReferences?.length || undefined,
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
    const message =
      error instanceof ItiOpenAiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "ITI document analysis failed.";

    return {
      fileName: document.fileName,
      stage: "failed",
      status: "failed",
      warnings,
      error: message,
    };
  } finally {
    if (openAiFileIds.length) {
      await deleteOpenAiFiles(client, openAiFileIds);
    }
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
  if (!successful.length) {
    const firstError = outcomes.find((outcome) => outcome.error)?.error;
    return {
      ok: false as const,
      error: firstError ?? "No documents were successfully analyzed by ITI.",
      outcomes,
    };
  }

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

  return {
    ok: true as const,
    extraction,
    rawJson: JSON.stringify(extraction),
    outcomes,
    conflicts,
  };
}
