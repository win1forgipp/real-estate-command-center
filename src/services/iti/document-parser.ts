import "server-only";

import { fetchBlobDocumentBuffer } from "@/services/iti/blob-fetch";
import type { ItiDocumentType } from "@/services/iti/types";

export function detectItiDocumentType(fileName: string): ItiDocumentType {
  const lower = fileName.toLowerCase();

  if (lower.includes("purchase") || lower.includes("contract") || lower.includes("psa")) {
    return "purchase_agreement";
  }
  if (lower.includes("repair") && lower.includes("addendum")) {
    return "repair_addendum";
  }
  if (lower.includes("addendum")) {
    return "addendum";
  }
  if (lower.includes("amendment")) {
    return "amendment";
  }
  if (lower.includes("contingency") || lower.includes("removal")) {
    return "contingency_removal";
  }
  if (lower.includes("inspection")) {
    return "inspection_response";
  }
  if (
    lower.includes("closing") ||
    lower.includes("settlement") ||
    lower.includes("disclosure")
  ) {
    return "closing_document";
  }
  return "other";
}

export async function parseDocumentTextFromBuffer(buffer: Buffer, fileType: string) {
  if (fileType.startsWith("image/")) {
    return "[Image uploaded. OCR not enabled in ITI v1.]";
  }

  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    await parser.destroy();
    return textResult.text?.trim() || "";
  } catch {
    return "";
  }
}

export async function parseDocumentTextFromBlob(blobUrl: string, fileType: string, fileSize: number) {
  if (fileType.startsWith("image/")) {
    return "[Image uploaded. OCR not enabled in ITI v1.]";
  }

  const { buffer } = await fetchBlobDocumentBuffer(blobUrl, fileSize);
  return parseDocumentTextFromBuffer(buffer, fileType);
}

export async function parseUploadedBlobDocuments(
  files: {
    fileName: string;
    fileType: string;
    fileSize: number;
    blobUrl: string;
  }[],
) {
  const chunks = await Promise.all(
    files.map(async (file) => {
      const text = await parseDocumentTextFromBlob(
        file.blobUrl,
        file.fileType,
        file.fileSize,
      );
      return `--- ${file.fileName} ---\n${text}`;
    }),
  );
  return chunks.join("\n\n");
}

function getDocumentTextChunk(documentText: string, fileName: string) {
  const marker = `--- ${fileName} ---`;
  if (!documentText.includes(marker)) {
    return "";
  }

  return documentText.split(marker)[1]?.split("\n--- ")[0]?.trim() ?? "";
}

export { getDocumentTextChunk };
