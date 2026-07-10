import "server-only";

export type ItiOpenAiDiagnosticPayload = {
  stage:
    | "blob_fetch_started"
    | "blob_fetch_succeeded"
    | "blob_fetch_failed"
    | "openai_upload_started"
    | "openai_file_created"
    | "openai_upload_failed"
    | "responses_request_started"
    | "responses_request_succeeded"
    | "responses_request_failed"
    | "validation_started"
    | "validation_succeeded"
    | "validation_failed"
    | "openai_file_delete_started"
    | "openai_file_deleted"
    | "openai_file_delete_failed";
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  openAiFileId?: string;
  model?: string;
  responseStatus?: string;
  outputTextLength?: number;
  validationStatus?: "passed" | "failed";
  errorName?: string;
  errorCode?: string;
  errorMessage?: string;
};

export function logItiOpenAiDiagnostic(payload: ItiOpenAiDiagnosticPayload) {
  console.info("[ITI:openai]", {
    ...payload,
    timestamp: new Date().toISOString(),
  });
}
