import "server-only";

import OpenAI, { toFile } from "openai";

import { logItiOpenAiDiagnostic } from "@/services/iti/openai/diagnostics";
import { ItiOpenAiError, mapOpenAiError } from "@/services/iti/openai/errors";

export async function uploadPdfToOpenAi(input: {
  client: OpenAI;
  buffer: Buffer;
  fileName: string;
  mimeType?: string;
}) {
  logItiOpenAiDiagnostic({
    stage: "openai_upload_started",
    fileName: input.fileName,
    mimeType: input.mimeType ?? "application/pdf",
    fileSize: input.buffer.byteLength,
  });

  try {
    const uploaded = await input.client.files.create({
      file: await toFile(input.buffer, input.fileName, {
        type: input.mimeType ?? "application/pdf",
      }),
      purpose: "user_data",
    });

    logItiOpenAiDiagnostic({
      stage: "openai_file_created",
      fileName: input.fileName,
      mimeType: input.mimeType ?? "application/pdf",
      fileSize: input.buffer.byteLength,
      openAiFileId: uploaded.id,
    });

    return uploaded.id;
  } catch (error) {
    const mapped = mapOpenAiError(error, "openai_upload_failed");
    logItiOpenAiDiagnostic({
      stage: "openai_upload_failed",
      fileName: input.fileName,
      mimeType: input.mimeType ?? "application/pdf",
      fileSize: input.buffer.byteLength,
      errorName: mapped.name,
      errorCode: mapped.code,
      errorMessage: mapped.message,
    });
    throw new ItiOpenAiError("openai_upload_failed", mapped.message, { cause: error });
  }
}

export async function deleteOpenAiFile(client: OpenAI, fileId: string, fileName?: string) {
  logItiOpenAiDiagnostic({
    stage: "openai_file_delete_started",
    fileName,
    openAiFileId: fileId,
  });

  try {
    await client.files.delete(fileId);
    logItiOpenAiDiagnostic({
      stage: "openai_file_deleted",
      fileName,
      openAiFileId: fileId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OpenAI file cleanup failed.";
    logItiOpenAiDiagnostic({
      stage: "openai_file_delete_failed",
      fileName,
      openAiFileId: fileId,
      errorName: error instanceof Error ? error.name : "Error",
      errorMessage: message,
    });
  }
}

export async function deleteOpenAiFiles(client: OpenAI, fileIds: string[]) {
  await Promise.all(fileIds.map((fileId) => deleteOpenAiFile(client, fileId)));
}
