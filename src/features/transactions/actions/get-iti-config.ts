"use server";

import { getItiSetupMessage, isItiConfigured } from "@/services/iti";

export async function getItiConfigAction() {
  const isBlobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());

  return {
    isConfigured: isItiConfigured(),
    setupMessage: getItiSetupMessage(),
    isBlobConfigured,
    blobSetupMessage: isBlobConfigured
      ? undefined
      : "BLOB_READ_WRITE_TOKEN is not configured. ITI uploads require Vercel Blob storage.",
  };
}
