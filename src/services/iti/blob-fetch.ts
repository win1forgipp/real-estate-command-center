import "server-only";

import { get } from "@vercel/blob";

import { getBlobAccessMode, hasBlobReadWriteToken } from "@/services/iti/blob-config";
import { validateBlobUrl } from "@/services/iti/blob-security";

export async function fetchBlobDocumentBuffer(blobUrl: string, expectedSize?: number) {
  if (!hasBlobReadWriteToken()) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured on the server.");
  }

  const validation = validateBlobUrl(blobUrl);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const access = getBlobAccessMode();
  const result = await get(validation.url.toString(), { access });

  if (!result || result.statusCode !== 200 || !result.stream) {
    const statusCode = result?.statusCode ?? "unknown";
    throw new Error(`Could not fetch uploaded document (${statusCode}).`);
  }

  const arrayBuffer = await new Response(result.stream).arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (expectedSize && buffer.byteLength !== expectedSize) {
    throw new Error("Uploaded file size does not match the declared metadata.");
  }

  return {
    buffer,
    contentType: result.blob.contentType || "application/octet-stream",
  };
}
