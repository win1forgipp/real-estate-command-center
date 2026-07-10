import { getBlobAccessMode, isBlobConfigured } from "@/services/iti/blob-config";
import {
  getItiOpenAiModel,
  getRequestedPdfProcessingMode,
  modelSupportsFileInputs,
} from "@/services/iti/openai/config";
import { getItiProviderName } from "@/services/iti/provider";

export function validateItiProductionConfig(options?: { allowMock?: boolean }) {
  const errors: string[] = [];

  const pdfMode = getRequestedPdfProcessingMode();
  if (pdfMode !== "openai_file") {
    errors.push(
      `ITI_PDF_PROCESSING_MODE=${pdfMode} is not supported. Set ITI_PDF_PROCESSING_MODE=openai_file.`,
    );
  }

  if (options?.allowMock) {
    return errors.length
      ? {
          ok: false as const,
          error: errors.join(" "),
        }
      : { ok: true as const };
  }

  if (!isBlobConfigured()) {
    errors.push("Vercel Blob is not configured. Set BLOB_STORE_ID and BLOB_WEBHOOK_PUBLIC_KEY.");
  }

  if (getBlobAccessMode() !== "private") {
    errors.push("BLOB_ACCESS_MODE must be private for ITI document imports.");
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    errors.push("OPENAI_API_KEY is not configured.");
  }

  if (getItiProviderName() !== "openai") {
    errors.push("ITI_PROVIDER must be openai for live ITI extraction.");
  }

  const model = getItiOpenAiModel();
  if (!model.trim()) {
    errors.push("ITI_OPENAI_MODEL is not configured.");
  } else if (!modelSupportsFileInputs(model)) {
    errors.push(`The configured ITI model (${model}) does not support PDF file inputs.`);
  }

  if (errors.length) {
    return {
      ok: false as const,
      error: errors.join(" "),
    };
  }

  return { ok: true as const };
}
