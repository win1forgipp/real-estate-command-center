export type ItiOpenAiDiagnosticPayload = {
  stage:
    | "route_entered"
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
    | "openai_file_delete_failed"
    | "package_consolidation_started"
    | "package_consolidation_succeeded"
    | "package_consolidation_failed"
    | "file_completed"
    | "file_failed";
  importSessionId?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  downloadedSize?: number;
  openAiFileId?: string;
  model?: string;
  responseStatus?: string;
  outputTextLength?: number;
  validationStatus?: "passed" | "failed";
  pipeline?: "openai_file";
  provider?: "openai" | "mock";
  errorName?: string;
  errorCode?: string;
  errorMessage?: string;
  errorClass?: string;
};

export function logItiOpenAiDiagnostic(payload: ItiOpenAiDiagnosticPayload) {
  console.info("[ITI:openai]", {
    ...payload,
    timestamp: new Date().toISOString(),
  });
}
