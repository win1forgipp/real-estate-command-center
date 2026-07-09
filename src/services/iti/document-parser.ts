import "server-only";

import { getAbsoluteStoragePath } from "@/services/document-storage";
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

export async function parseDocumentText(storagePath: string, fileType: string) {
  const absolutePath = getAbsoluteStoragePath(storagePath);

  if (fileType.startsWith("image/")) {
    return `[Image: ${storagePath}. OCR not enabled in ITI v1.]`;
  }

  try {
    const { PDFParse } = await import("pdf-parse");
    const { readFile } = await import("node:fs/promises");
    const buffer = await readFile(absolutePath);
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    await parser.destroy();
    return textResult.text?.trim() || "";
  } catch {
    return "";
  }
}

export async function parseUploadedDocuments(
  files: { storagePath: string; fileType: string; fileName: string }[],
) {
  const chunks = await Promise.all(
    files.map(async (file) => {
      const text = await parseDocumentText(file.storagePath, file.fileType);
      return `--- ${file.fileName} ---\n${text}`;
    }),
  );
  return chunks.join("\n\n");
}
