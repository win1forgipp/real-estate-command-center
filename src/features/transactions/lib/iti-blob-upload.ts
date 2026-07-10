"use client";

import { upload } from "@vercel/blob/client";

import { buildItiBlobPathname } from "@/services/iti/blob-paths";
import {
  formatBlobSdkError,
  type ItiBlobAccessMode,
} from "@/services/iti/blob-config.shared";

type UploadItiFileOptions = {
  file: File;
  importSessionId: string;
  accessMode: ItiBlobAccessMode;
  onProgress?: (progress: number) => void;
};

export async function uploadItiFileToBlob({
  file,
  importSessionId,
  accessMode,
  onProgress,
}: UploadItiFileOptions) {
  const pathname = buildItiBlobPathname(importSessionId, file.name);

  try {
    const blob = await upload(pathname, file, {
      access: accessMode,
      handleUploadUrl: "/api/blob/upload",
      clientPayload: JSON.stringify({ importSessionId }),
      onUploadProgress: (event) => {
        onProgress?.(event.percentage);
      },
    });

    return {
      name: file.name,
      url: blob.url,
      pathname: blob.pathname,
      mimeType: blob.contentType || file.type || "application/octet-stream",
      size: file.size,
    };
  } catch (error) {
    const formatted = formatBlobSdkError(error);
    throw new Error(`${formatted.name}: ${formatted.message}`);
  }
}

export async function requestItiExtraction(input: {
  importSessionId: string;
  files: Array<{
    name: string;
    url: string;
    pathname: string;
    mimeType: string;
    size: number;
  }>;
}) {
  const response = await fetch("/api/iti/extract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return {
      ok: false,
      error: "ITI returned a non-JSON response. Try again or continue manually.",
      files: [],
    };
  }

  if (!payload || typeof payload !== "object" || !("ok" in payload)) {
    return {
      ok: false,
      error: "ITI returned an unexpected response. Try again or continue manually.",
      files: [],
    };
  }

  return payload as {
    ok: boolean;
    error?: string;
    warning?: string | null;
    provider?: "openai" | "mock";
    extractionId?: string;
    documentIds?: string[];
    extraction?: import("@/services/iti/types").ItiExtractionResult;
    files?: import("@/services/iti/types").ItiProcessedFileResult[];
  };
}
