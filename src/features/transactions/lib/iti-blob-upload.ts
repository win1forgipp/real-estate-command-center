"use client";

import { uploadPresigned } from "@vercel/blob/client";

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

async function readUploadRouteError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    if (payload.error?.trim()) {
      return payload.error;
    }
  } catch {
    // Fall through to status-based message.
  }

  return `Blob upload authorization failed (${response.status}).`;
}

export async function uploadItiFileToBlob({
  file,
  importSessionId,
  accessMode,
  onProgress,
}: UploadItiFileOptions) {
  const pathname = buildItiBlobPathname(importSessionId, file.name);

  try {
    const blob = await uploadPresigned(pathname, file, {
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
    if (error instanceof Response) {
      throw new Error(await readUploadRouteError(error));
    }

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
      error: `ITI returned a non-JSON response (${response.status}). Try again or continue manually.`,
      files: [],
    };
  }

  if (!payload || typeof payload !== "object" || !("ok" in payload)) {
    return {
      ok: false,
      error: `ITI returned an unexpected response (${response.status}). Try again or continue manually.`,
      files: [],
    };
  }

  const result = payload as {
    ok: boolean;
    error?: string;
    warning?: string | null;
    provider?: "openai" | "mock";
    extractionId?: string;
    documentIds?: string[];
    extraction?: import("@/services/iti/types").ItiExtractionResult;
    files?: import("@/services/iti/types").ItiProcessedFileResult[];
  };

  if (!result.ok && !result.error) {
    return {
      ...result,
      error: `ITI extraction failed (${response.status}). Try again or continue manually.`,
    };
  }

  return result;
}
