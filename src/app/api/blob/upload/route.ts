import { issueSignedToken } from "@vercel/blob";
import {
  handleUploadPresigned,
  type HandleUploadPresignedBody,
} from "@vercel/blob/client";
import { NextResponse } from "next/server";

import {
  getBlobAccessMode,
  getBlobAuthMode,
  getBlobSetupMessage,
  isBlobConfigured,
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

  if (!isBlobConfigured()) {
    const setupMessage = getBlobSetupMessage() ?? "Vercel Blob is not configured.";

    logBlobUploadDiagnostic({
      phase: "not-configured",
      errorName: "BlobNotConfigured",
      errorMessage: setupMessage,
    });

    return NextResponse.json({ error: setupMessage }, { status: 503 });
  }

  const body = (await request.json()) as HandleUploadPresignedBody;

  try {
    const jsonResponse = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname, clientPayload) => {
        const importSessionId = parseImportSessionId(clientPayload);

        if (!importSessionId) {
          throw new Error("Import session is required for ITI uploads.");
        }

        const pathnameValidation = validateBlobPathname(pathname, importSessionId);
        if (!pathnameValidation.ok) {
          throw new Error(pathnameValidation.error);
        }

        logBlobUploadDiagnostic({ phase: "authorized" });

        const token = await issueSignedToken({
          pathname,
          operations: ["put"],
          allowedContentTypes: [...ITI_ALLOWED_MIME_TYPES],
          maximumSizeInBytes: ITI_MAX_FILE_SIZE_BYTES,
        });

        return {
          token,
          urlOptions: {
            access: getBlobAccessMode(),
            addRandomSuffix: false,
            allowedContentTypes: [...ITI_ALLOWED_MIME_TYPES],
            maximumSizeInBytes: ITI_MAX_FILE_SIZE_BYTES,
            tokenPayload: clientPayload,
          },
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const importSessionId = parseImportSessionId(tokenPayload);
        logBlobUploadDiagnostic({ phase: "completed" });
        console.info("[ITI Blob Upload]", {
          routeReached: true,
          blobClientInitialized: true,
          storeIdDetected: true,
          authMode: getBlobAuthMode(),
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
