import "server-only";

import type OpenAI from "openai";

import { requestStructuredDocumentExtraction } from "@/services/iti/openai/analyze-document";

export async function analyzeImageFile(input: {
  client: OpenAI;
  buffer: Buffer;
  fileName: string;
  mimeType: "image/png" | "image/jpeg";
}) {
  const imageUrl = `data:${input.mimeType};base64,${input.buffer.toString("base64")}`;

  const extraction = await requestStructuredDocumentExtraction({
    client: input.client,
    fileName: input.fileName,
    imageUrl,
  });

  return { extraction };
}
