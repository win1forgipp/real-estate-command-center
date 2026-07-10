"use server";

import type { RunItiExtractionResponse } from "@/services/iti/types";

/**
 * @deprecated ITI no longer accepts raw files through Server Actions.
 * Upload files directly to Vercel Blob, then call POST /api/iti/extract.
 */
export async function runItiExtractionAction(): Promise<RunItiExtractionResponse> {
  return {
    ok: false,
    error:
      "ITI no longer accepts raw file uploads through Server Actions. Upload files to Blob storage first, then run ITI.",
    provider: "mock",
  };
}

/** @deprecated Use POST /api/iti/extract */
export const extractTransactionDocumentsAction = runItiExtractionAction;
