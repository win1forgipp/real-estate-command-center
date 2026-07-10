import "server-only";

import type OpenAI from "openai";

import { requestStructuredDocumentExtraction } from "@/services/iti/openai/analyze-document";
import { logItiOpenAiDiagnostic } from "@/services/iti/openai/diagnostics";
import { ItiOpenAiError } from "@/services/iti/openai/errors";
import { deleteOpenAiFile, uploadPdfToOpenAi } from "@/services/iti/openai/upload-file";
import { validateRawDocumentExtraction } from "@/services/iti/openai/validate-extraction-schema";

export async function analyzePdfWithOpenAIFile(input: {
  client: OpenAI;
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  importSessionId?: string;
  declaredSize?: number;
}) {
  const isPdf =
    input.mimeType === "application/pdf" || input.fileName.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    throw new ItiOpenAiError(
      "unsupported_file_type",
      `${input.fileName} is not a PDF document.`,
    );
  }

  if (!input.buffer.byteLength) {
    throw new ItiOpenAiError(
      "validation_failed",
      `ITI could not analyze ${input.fileName} because the downloaded file was empty.`,
    );
  }

  if (input.declaredSize && input.buffer.byteLength !== input.declaredSize) {
    throw new ItiOpenAiError(
      "validation_failed",
      `ITI could not analyze ${input.fileName} because the downloaded size did not match the upload metadata.`,
    );
  }

  const fileId = await uploadPdfToOpenAi({
    client: input.client,
    buffer: input.buffer,
    fileName: input.fileName,
    mimeType: input.mimeType,
  });

  try {
    const raw = await requestStructuredDocumentExtraction({
      client: input.client,
      fileName: input.fileName,
      fileId,
      importSessionId: input.importSessionId,
    });

    logItiOpenAiDiagnostic({
      stage: "validation_started",
      importSessionId: input.importSessionId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSize: input.buffer.byteLength,
      openAiFileId: fileId,
    });

    const validated = validateRawDocumentExtraction(raw, input.fileName);

    logItiOpenAiDiagnostic({
      stage: "validation_succeeded",
      importSessionId: input.importSessionId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSize: input.buffer.byteLength,
      openAiFileId: fileId,
      validationStatus: "passed",
    });

    return validated;
  } catch (error) {
    logItiOpenAiDiagnostic({
      stage: "validation_failed",
      importSessionId: input.importSessionId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSize: input.buffer.byteLength,
      openAiFileId: fileId,
      validationStatus: "failed",
      errorMessage: error instanceof Error ? error.message : "Validation failed.",
    });
    throw error;
  } finally {
    await deleteOpenAiFile(input.client, fileId, input.fileName);
  }
}
