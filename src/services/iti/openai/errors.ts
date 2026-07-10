export type ItiOpenAiErrorCode =
  | "blob_fetch_failed"
  | "openai_upload_failed"
  | "unsupported_model"
  | "responses_api_failed"
  | "empty_model_output"
  | "validation_failed"
  | "file_too_large"
  | "package_too_large"
  | "timeout"
  | "unsupported_file_type"
  | "heic_unsupported";

export class ItiOpenAiError extends Error {
  readonly code: ItiOpenAiErrorCode;

  constructor(code: ItiOpenAiErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ItiOpenAiError";
    this.code = code;
  }
}

export function mapOpenAiError(error: unknown, fallbackCode: ItiOpenAiErrorCode): ItiOpenAiError {
  if (error instanceof ItiOpenAiError) {
    return error;
  }

  const message = error instanceof Error ? error.message : "OpenAI request failed.";
  const code =
    /timed out|timeout/i.test(message)
      ? "timeout"
      : /model/i.test(message) && /not|unsupported|invalid/i.test(message)
        ? "unsupported_model"
        : fallbackCode;

  return new ItiOpenAiError(code, message, { cause: error });
}
