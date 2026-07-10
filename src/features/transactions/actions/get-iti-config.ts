"use server";

import { getItiSetupMessage, isItiConfigured } from "@/services/iti";
import { getBlobAccessMode, hasBlobReadWriteToken } from "@/services/iti/blob-config";

export async function getItiConfigAction() {
  const isBlobConfigured = hasBlobReadWriteToken();

  return {
    isConfigured: isItiConfigured(),
    setupMessage: getItiSetupMessage(),
    isBlobConfigured,
    blobAccessMode: getBlobAccessMode(),
    blobSetupMessage: isBlobConfigured
      ? undefined
      : "BLOB_READ_WRITE_TOKEN is not configured. ITI uploads require Vercel Blob storage.",
  };
}
