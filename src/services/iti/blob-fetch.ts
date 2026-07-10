import "server-only";

import { validateBlobUrl } from "@/services/iti/blob-security";

export async function fetchBlobDocumentBuffer(blobUrl: string, expectedSize?: number) {
  const validation = validateBlobUrl(blobUrl);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const response = await fetch(validation.url.toString(), {
    method: "GET",
    redirect: "error",
  });

  if (!response.ok) {
    throw new Error(`Could not fetch uploaded document (${response.status}).`);
  }

  const contentType = response.headers.get("content-type") ?? "application/octet-stream";
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (expectedSize && buffer.byteLength !== expectedSize) {
    throw new Error("Uploaded file size does not match the declared metadata.");
  }

  return { buffer, contentType };
}
