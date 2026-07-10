export type ItiPdfProcessingMode = "openai_file" | "legacy_render" | "embedded_text_only";

export const OPENAI_FILE_MAX_BYTES = 50 * 1024 * 1024;
export const OPENAI_REQUEST_MAX_BYTES = 50 * 1024 * 1024;

const FILE_INPUT_MODEL_PREFIXES = ["gpt-4o", "gpt-4.1", "gpt-5", "o1", "o3", "o4"];

export function getItiPdfProcessingMode(): ItiPdfProcessingMode {
  const mode = process.env.ITI_PDF_PROCESSING_MODE?.trim().toLowerCase();

  if (mode === "legacy_render" || mode === "embedded_text_only") {
    return mode;
  }

  return "openai_file";
}

export function getItiOpenAiModel() {
  const model = process.env.ITI_OPENAI_MODEL?.trim();
  if (!model) {
    return "gpt-4o";
  }
  return model;
}

export function modelSupportsFileInputs(model: string) {
  const normalized = model.trim().toLowerCase();
  return FILE_INPUT_MODEL_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export function validateOpenAiFileSize(fileSize: number, fileName: string) {
  if (fileSize > OPENAI_FILE_MAX_BYTES) {
    return {
      ok: false as const,
      error: `${fileName} exceeds the OpenAI file input limit of ${Math.floor(OPENAI_FILE_MAX_BYTES / (1024 * 1024))} MB.`,
    };
  }

  return { ok: true as const };
}

export function validateOpenAiRequestBatchSize(totalBytes: number) {
  if (totalBytes > OPENAI_REQUEST_MAX_BYTES) {
    return {
      ok: false as const,
      error: `This ITI batch exceeds the OpenAI per-request limit of ${Math.floor(OPENAI_REQUEST_MAX_BYTES / (1024 * 1024))} MB. Upload fewer files or smaller documents.`,
    };
  }

  return { ok: true as const };
}
