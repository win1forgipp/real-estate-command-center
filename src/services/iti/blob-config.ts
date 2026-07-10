import "server-only";

import {
  formatBlobSdkError,
  resolveBlobAccessMode,
  type ItiBlobAccessMode,
  type ItiBlobAuthMode,
} from "@/services/iti/blob-config.shared";

export type { ItiBlobAccessMode, ItiBlobAuthMode };

export function getBlobStoreId() {
  const storeId = process.env.BLOB_STORE_ID?.trim();
  return storeId || undefined;
}

export function hasBlobReadWriteToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function hasOidcBlobAuth() {
  return Boolean(getBlobStoreId());
}

export function getBlobAuthMode(): ItiBlobAuthMode {
  if (hasOidcBlobAuth()) {
    return "oidc";
  }

  if (hasBlobReadWriteToken()) {
    return "token";
  }

  return "none";
}

export function isBlobConfigured() {
  return getBlobAuthMode() !== "none";
}

export function getBlobAccessMode(): ItiBlobAccessMode {
  return resolveBlobAccessMode(process.env.BLOB_ACCESS_MODE);
}

export function getBlobSetupMessage() {
  if (isBlobConfigured()) {
    return undefined;
  }

  return "Vercel Blob is not configured. Connect a Blob store to this project (OIDC) or provide BLOB_READ_WRITE_TOKEN for legacy token auth.";
}

type BlobUploadDiagnostic = {
  phase:
    | "reached"
    | "not-configured"
    | "authorized"
    | "completed"
    | "failed";
  errorName?: string;
  errorMessage?: string;
};

export function logBlobUploadDiagnostic(payload: BlobUploadDiagnostic) {
  console.info("[ITI Blob Upload]", {
    routeReached: true,
    blobClientInitialized: isBlobConfigured(),
    storeIdDetected: Boolean(getBlobStoreId()),
    authMode: getBlobAuthMode(),
    accessMode: getBlobAccessMode(),
    phase: payload.phase,
    ...(payload.errorName ? { errorName: payload.errorName } : {}),
    ...(payload.errorMessage ? { errorMessage: payload.errorMessage } : {}),
  });
}

export function toBlobRouteError(error: unknown) {
  const formatted = formatBlobSdkError(error);
  return {
    ...formatted,
    message: `${formatted.name}: ${formatted.message}`,
  };
}
