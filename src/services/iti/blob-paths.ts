import { ITI_BLOB_TEMP_PREFIX } from "@/services/iti/constants";

export function sanitizeItiFileName(fileName: string) {
  const baseName = fileName.split(/[/\\]/).pop() ?? "document";
  const sanitized = baseName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180);
  return sanitized || "document";
}

export function buildItiBlobPathname(importSessionId: string, fileName: string) {
  const safeName = sanitizeItiFileName(fileName);
  return `${ITI_BLOB_TEMP_PREFIX}/${importSessionId}/${crypto.randomUUID()}-${safeName}`;
}
