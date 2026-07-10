import "server-only";

import type OpenAI from "openai";

import { requestStructuredDocumentExtraction } from "@/services/iti/openai/analyze-document";
import { validateRawDocumentExtraction } from "@/services/iti/openai/validate-extraction-schema";

export async function analyzeImageFile(input: {
  client: OpenAI;
  buffer: Buffer;
  fileName: string;
  mimeType: "image/png" | "image/jpeg";
  importSessionId?: string;
}) {
  const imageUrl = `data:${input.mimeType};base64,${input.buffer.toString("base64")}`;

  const extraction = await requestStructuredDocumentExtraction({
    client: input.client,
    fileName: input.fileName,
    imageUrl,
    importSessionId: input.importSessionId,
  });

  return { extraction: validateRawDocumentExtraction(extraction, input.fileName) };
}
