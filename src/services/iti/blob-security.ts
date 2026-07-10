import "server-only";

import { ITI_BLOB_TEMP_PREFIX } from "@/services/iti/constants";

export { buildItiBlobPathname, sanitizeItiFileName } from "@/services/iti/blob-paths";

export function isAllowedBlobHostname(hostname: string) {
  const normalized = hostname.toLowerCase();
  return (
    normalized.endsWith(".public.blob.vercel-storage.com") ||
    normalized.endsWith(".blob.vercel-storage.com") ||
    normalized === "public.blob.vercel-storage.com"
  );
}

export function validateBlobUrl(url: string) {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return { ok: false as const, error: "Invalid blob URL." };
  }

  if (parsed.protocol !== "https:") {
    return { ok: false as const, error: "Blob URL must use HTTPS." };
  }

  if (!isAllowedBlobHostname(parsed.hostname)) {
    return { ok: false as const, error: "Blob URL host is not allowed." };
  }

  return { ok: true as const, url: parsed };
}

export function validateBlobPathname(pathname: string, importSessionId: string) {
  const expectedPrefix = `${ITI_BLOB_TEMP_PREFIX}/${importSessionId}/`;

  if (!pathname.startsWith(expectedPrefix)) {
    return {
      ok: false as const,
      error: "Blob pathname does not match the current import session.",
    };
  }

  if (pathname.includes("..")) {
    return { ok: false as const, error: "Invalid blob pathname." };
  }

  return { ok: true as const, pathname };
}
