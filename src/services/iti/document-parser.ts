import "server-only";

import { fetchBlobDocumentBuffer } from "@/services/iti/blob-fetch";
import { processDocument, processUploadedBlobDocuments } from "@/services/iti/document-processing/process-document";
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

export async function parseDocumentTextFromBuffer(
  buffer: Buffer,
  fileType: string,
  fileName = "document",
  options?: { useMock?: boolean },
) {
  const result = await processDocument({
    fileName,
    fileType,
    buffer,
    useMock: options?.useMock,
  });
  return result.text;
}

export async function parseDocumentTextFromBlob(
  blobUrl: string,
  fileType: string,
  fileSize: number,
  fileName = "document",
  options?: { useMock?: boolean },
) {
  const { buffer } = await fetchBlobDocumentBuffer(blobUrl, fileSize);
  return parseDocumentTextFromBuffer(buffer, fileType, fileName, options);
}

export { processUploadedBlobDocuments };

export async function parseUploadedBlobDocuments(
  files: {
    fileName: string;
    fileType: string;
    fileSize: number;
    blobUrl: string;
  }[],
  options?: { useMock?: boolean },
) {
  const { documentText } = await processUploadedBlobDocuments(files, options);
  return documentText;
}

function getDocumentTextChunk(documentText: string, fileName: string) {
  const marker = `--- ${fileName} ---`;
  if (!documentText.includes(marker)) {
    return "";
  }

  return documentText.split(marker)[1]?.split("\n--- ")[0]?.trim() ?? "";
}

export { getDocumentTextChunk };
