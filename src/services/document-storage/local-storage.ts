import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ItiDocumentType } from "@/services/iti/types";

/**
 * Local filesystem storage for development.
 * Production: swap for Vercel Blob, UploadThing, or S3-compatible object storage.
 * Do not store large PDF binaries in Turso — only metadata + storage_path references.
 */
const UPLOAD_ROOT = path.join(process.cwd(), ".data", "uploads");

export type StoredFile = {
  storagePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
};

export async function storeUploadedFile(
  file: File,
  documentType: ItiDocumentType,
): Promise<StoredFile> {
  const id = crypto.randomUUID();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const relativePath = path.join(documentType, `${id}-${safeName}`);
  const absolutePath = path.join(UPLOAD_ROOT, relativePath);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return {
    storagePath: relativePath,
    fileName: file.name,
    fileType: file.type || "application/pdf",
    fileSize: buffer.byteLength,
  };
}

export function getAbsoluteStoragePath(storagePath: string) {
  return path.join(UPLOAD_ROOT, storagePath);
}
