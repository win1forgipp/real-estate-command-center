import "server-only";

import {
  formatBlobSdkError,
  resolveBlobAccessMode,
  type ItiBlobAccessMode,
} from "@/services/iti/blob-config.shared";

export type { ItiBlobAccessMode };

export function hasBlobReadWriteToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function getBlobAccessMode(): ItiBlobAccessMode {
  return resolveBlobAccessMode(process.env.BLOB_ACCESS_MODE);
}

type BlobUploadDiagnostic = {
  phase: "reached" | "token-missing" | "authorized" | "completed" | "failed";
  errorName?: string;
  errorMessage?: string;
};

export function logBlobUploadDiagnostic(payload: BlobUploadDiagnostic) {
  console.info("[ITI Blob Upload]", {
    routeReached: true,
    tokenConfigured: hasBlobReadWriteToken(),
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
