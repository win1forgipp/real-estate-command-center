import "server-only";

import { getAbsoluteStoragePath } from "@/services/document-storage";

export async function extractTextFromUpload(storagePath: string, fileType: string) {
  const absolutePath = getAbsoluteStoragePath(storagePath);

  if (fileType.startsWith("image/")) {
    return `[Image upload: ${storagePath}. OCR is not enabled in v1.]`;
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

export async function extractTextFromUploads(
  files: { storagePath: string; fileType: string; fileName: string }[],
) {
  const chunks = await Promise.all(
    files.map(async (file) => {
      const text = await extractTextFromUpload(file.storagePath, file.fileType);
      return `--- ${file.fileName} ---\n${text}`;
    }),
  );

  return chunks.join("\n\n");
}
