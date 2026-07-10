"use client";

import { upload } from "@vercel/blob/client";

import { buildItiBlobPathname } from "@/services/iti/blob-paths";

type UploadItiFileOptions = {
  file: File;
  importSessionId: string;
  onProgress?: (progress: number) => void;
};

export async function uploadItiFileToBlob({
  file,
  importSessionId,
  onProgress,
}: UploadItiFileOptions) {
  const pathname = buildItiBlobPathname(importSessionId, file.name);

  const blob = await upload(pathname, file, {
    access: "public",
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
