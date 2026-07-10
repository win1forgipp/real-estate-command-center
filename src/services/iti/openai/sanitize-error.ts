import { ItiOpenAiError } from "@/services/iti/openai/errors";

const INTERNAL_PDF_PATTERNS = [
  /DOMMatrix/i,
  /pdf-parse/i,
  /pdfjs/i,
  /@napi-rs\/canvas/i,
  /getScreenshot/i,
];

export function sanitizeItiUserErrorMessage(error: unknown, fileName?: string) {
  const prefix = fileName ? `${fileName}: ` : "";

  if (error instanceof ItiOpenAiError) {
    switch (error.code) {
      case "blob_fetch_failed":
        return fileName
          ? `ITI could not retrieve ${fileName} from secure storage.`
          : "ITI could not retrieve an uploaded document from secure storage.";
      case "openai_upload_failed":
        return fileName
          ? `OpenAI rejected the uploaded PDF ${fileName}. Verify the file is a valid PDF under 50 MB.`
          : "OpenAI rejected an uploaded PDF.";
      case "unsupported_model":
        return "The configured ITI model does not support PDF file inputs.";
      case "responses_api_failed":
        return fileName
          ? `ITI could not analyze ${fileName} with OpenAI. Retry when ready.`
          : "ITI could not analyze a document with OpenAI.";
      case "empty_model_output":
        return fileName
          ? `ITI received an empty analysis result for ${fileName}.`
          : "ITI received an empty analysis result.";
      case "validation_failed":
        return error.message;
      case "file_too_large":
        return error.message;
      case "timeout":
        return fileName
          ? `ITI timed out while analyzing ${fileName}. Your uploaded file is preserved; retry when ready.`
          : "ITI timed out while analyzing a document.";
      default:
        return `${prefix}${error.message}`;
    }
  }

  const message = error instanceof Error ? error.message : String(error);

  if (INTERNAL_PDF_PATTERNS.some((pattern) => pattern.test(message))) {
    return fileName
      ? `ITI encountered an internal PDF processing error while analyzing ${fileName}. This deployment uses OpenAI native PDF analysis only; retry or continue manually.`
      : "ITI encountered an internal PDF processing error. Retry or continue manually.";
  }

  return `${prefix}${message}`;
}
