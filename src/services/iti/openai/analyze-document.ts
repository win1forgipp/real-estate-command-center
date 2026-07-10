import "server-only";

import OpenAI from "openai";

import { getItiOpenAiModel, modelSupportsFileInputs } from "@/services/iti/openai/config";
import { logItiOpenAiDiagnostic } from "@/services/iti/openai/diagnostics";
import { ItiOpenAiError, mapOpenAiError } from "@/services/iti/openai/errors";
import {
  type ItiRawDocumentExtraction,
  buildResponsesRequestBody,
} from "@/services/iti/openai/schemas";
import { sanitizeItiUserErrorMessage } from "@/services/iti/openai/sanitize-error";

function parseResponsesOutput(response: OpenAI.Responses.Response, fileName: string) {
  if (response.status === "failed") {
    throw new ItiOpenAiError(
      "responses_api_failed",
      response.error?.message ??
        `ITI could not analyze ${fileName} with OpenAI. Your uploaded file is preserved; retry when ready.`,
    );
  }

  const outputText = response.output_text?.trim();
  if (!outputText) {
    throw new ItiOpenAiError(
      "empty_model_output",
      `ITI received an empty analysis result for ${fileName}.`,
    );
  }

  try {
    return JSON.parse(outputText) as ItiRawDocumentExtraction;
  } catch (error) {
    throw new ItiOpenAiError(
      "validation_failed",
      `ITI received an invalid structured response for ${fileName}.`,
      { cause: error },
    );
  }
}

export async function requestStructuredDocumentExtraction(input: {
  client: OpenAI;
  fileName: string;
  fileId?: string;
  imageUrl?: string;
  importSessionId?: string;
}) {
  const model = getItiOpenAiModel();

  if (input.fileId && !modelSupportsFileInputs(model)) {
    throw new ItiOpenAiError(
      "unsupported_model",
      "The configured ITI model does not support PDF file inputs.",
    );
  }

  logItiOpenAiDiagnostic({
    stage: "responses_request_started",
    importSessionId: input.importSessionId,
    fileName: input.fileName,
    model,
    openAiFileId: input.fileId,
    pipeline: "openai_file",
    provider: "openai",
  });

  try {
    const response = await input.client.responses.create(
      buildResponsesRequestBody({
        model,
        fileName: input.fileName,
        fileId: input.fileId,
        imageUrl: input.imageUrl,
      }),
    );

    const parsed = parseResponsesOutput(response, input.fileName);

    logItiOpenAiDiagnostic({
      stage: "responses_request_succeeded",
      importSessionId: input.importSessionId,
      fileName: input.fileName,
      model,
      openAiFileId: input.fileId,
      responseStatus: response.status,
      outputTextLength: response.output_text?.length ?? 0,
      validationStatus: "passed",
      pipeline: "openai_file",
      provider: "openai",
    });

    return parsed;
  } catch (error) {
    const mapped = mapOpenAiError(error, "responses_api_failed");
    logItiOpenAiDiagnostic({
      stage: "responses_request_failed",
      importSessionId: input.importSessionId,
      fileName: input.fileName,
      model,
      openAiFileId: input.fileId,
      errorName: mapped.name,
      errorCode: mapped.code,
      errorClass: mapped.name,
      errorMessage: mapped.message,
      validationStatus: "failed",
      pipeline: "openai_file",
      provider: "openai",
    });
    throw new ItiOpenAiError(mapped.code, sanitizeItiUserErrorMessage(mapped, input.fileName), {
      cause: error,
    });
  }
}
