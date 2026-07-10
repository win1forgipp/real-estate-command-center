import "server-only";

import OpenAI from "openai";

import { getItiOpenAiModel, modelSupportsFileInputs } from "@/services/iti/openai/config";
import { logItiOpenAiDiagnostic } from "@/services/iti/openai/diagnostics";
import { ItiOpenAiError, mapOpenAiError } from "@/services/iti/openai/errors";
import {
  type ItiRawDocumentExtraction,
  buildResponsesRequestBody,
} from "@/services/iti/openai/schemas";

function parseResponsesOutput(response: OpenAI.Responses.Response) {
  if (response.status === "failed") {
    throw new ItiOpenAiError(
      "responses_api_failed",
      response.error?.message ?? "OpenAI Responses API returned a failed status.",
    );
  }

  const outputText = response.output_text?.trim();
  if (!outputText) {
    throw new ItiOpenAiError("empty_model_output", "OpenAI returned an empty extraction response.");
  }

  try {
    return JSON.parse(outputText) as ItiRawDocumentExtraction;
  } catch (error) {
    throw new ItiOpenAiError("validation_failed", "OpenAI returned invalid JSON for ITI extraction.", {
      cause: error,
    });
  }
}

export async function requestStructuredDocumentExtraction(input: {
  client: OpenAI;
  fileName: string;
  fileId?: string;
  imageUrl?: string;
  embeddedText?: string;
}) {
  const model = getItiOpenAiModel();

  if (input.fileId && !modelSupportsFileInputs(model)) {
    throw new ItiOpenAiError(
      "unsupported_model",
      `ITI_OPENAI_MODEL (${model}) does not support PDF file inputs. Choose a vision-capable model such as gpt-4o.`,
    );
  }

  logItiOpenAiDiagnostic({
    stage: "responses_request_started",
    fileName: input.fileName,
    model,
    openAiFileId: input.fileId,
  });

  try {
    const response = await input.client.responses.create(
      buildResponsesRequestBody({
        model,
        fileName: input.fileName,
        fileId: input.fileId,
        imageUrl: input.imageUrl,
        embeddedText: input.embeddedText,
      }),
    );

    const parsed = parseResponsesOutput(response);

    logItiOpenAiDiagnostic({
      stage: "responses_request_succeeded",
      fileName: input.fileName,
      model,
      openAiFileId: input.fileId,
      responseStatus: response.status,
      outputTextLength: response.output_text?.length ?? 0,
      validationStatus: "passed",
    });

    return parsed;
  } catch (error) {
    const mapped = mapOpenAiError(error, "responses_api_failed");
    logItiOpenAiDiagnostic({
      stage: "responses_request_failed",
      fileName: input.fileName,
      model,
      openAiFileId: input.fileId,
      errorName: mapped.name,
      errorCode: mapped.code,
      errorMessage: mapped.message,
      validationStatus: "failed",
    });
    throw mapped;
  }
}
