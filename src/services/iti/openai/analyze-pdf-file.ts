import "server-only";

import type OpenAI from "openai";

import { requestStructuredDocumentExtraction } from "@/services/iti/openai/analyze-document";
import { uploadPdfToOpenAi } from "@/services/iti/openai/upload-file";

export async function analyzePdfFile(input: {
  client: OpenAI;
  buffer: Buffer;
  fileName: string;
  mimeType?: string;
  embeddedText?: string;
  openAiFileId?: string;
}) {
  let fileId = input.openAiFileId;
  let createdFileId: string | undefined;

  if (!fileId && !input.embeddedText) {
    fileId = await uploadPdfToOpenAi({
      client: input.client,
      buffer: input.buffer,
      fileName: input.fileName,
      mimeType: input.mimeType,
    });
    createdFileId = fileId;
  }

  const extraction = await requestStructuredDocumentExtraction({
    client: input.client,
    fileName: input.fileName,
    fileId,
    embeddedText: input.embeddedText,
  });

  return {
    extraction,
    openAiFileId: createdFileId,
  };
}
