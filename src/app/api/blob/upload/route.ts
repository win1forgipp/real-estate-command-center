import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import {
  getBlobAccessMode,
  hasBlobReadWriteToken,
  logBlobUploadDiagnostic,
  toBlobRouteError,
} from "@/services/iti/blob-config";
import { validateBlobPathname } from "@/services/iti/blob-security";
import { ITI_ALLOWED_MIME_TYPES, ITI_MAX_FILE_SIZE_BYTES } from "@/services/iti/constants";

export const runtime = "nodejs";

function parseImportSessionId(clientPayload?: string | null) {
  if (!clientPayload) {
    return null;
  }

  try {
    const parsed = JSON.parse(clientPayload) as { importSessionId?: string };
    return parsed.importSessionId?.trim() || null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  logBlobUploadDiagnostic({ phase: "reached" });

  if (!hasBlobReadWriteToken()) {
    logBlobUploadDiagnostic({
      phase: "token-missing",
      errorName: "BlobTokenMissing",
      errorMessage: "BLOB_READ_WRITE_TOKEN is not configured.",
    });

    return NextResponse.json(
      {
        error:
          "BLOB_READ_WRITE_TOKEN is not configured. Add it to your environment to enable ITI uploads.",
      },
      { status: 503 },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const importSessionId = parseImportSessionId(clientPayload);

        if (!importSessionId) {
          throw new Error("Import session is required for ITI uploads.");
        }

        const pathnameValidation = validateBlobPathname(pathname, importSessionId);
        if (!pathnameValidation.ok) {
          throw new Error(pathnameValidation.error);
        }

        logBlobUploadDiagnostic({ phase: "authorized" });

        return {
          allowedContentTypes: [...ITI_ALLOWED_MIME_TYPES],
          maximumSizeInBytes: ITI_MAX_FILE_SIZE_BYTES,
          addRandomSuffix: false,
          tokenPayload: clientPayload,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const importSessionId = parseImportSessionId(tokenPayload);
        logBlobUploadDiagnostic({ phase: "completed" });
        console.info("[ITI Blob Upload]", {
          routeReached: true,
          tokenConfigured: true,
          accessMode: getBlobAccessMode(),
          phase: "upload-completed",
          importSessionId,
          pathname: blob.pathname,
          contentType: blob.contentType,
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const formatted = toBlobRouteError(error);
    logBlobUploadDiagnostic({
      phase: "failed",
      errorName: formatted.name,
      errorMessage: formatted.message,
    });

    return NextResponse.json({ error: formatted.message }, { status: 400 });
  }
}
