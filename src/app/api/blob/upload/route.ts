import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { ITI_ALLOWED_MIME_TYPES, ITI_MAX_FILE_SIZE_BYTES } from "@/services/iti/constants";
import { validateBlobPathname } from "@/services/iti/blob-security";

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
  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
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

        return {
          allowedContentTypes: [...ITI_ALLOWED_MIME_TYPES],
          maximumSizeInBytes: ITI_MAX_FILE_SIZE_BYTES,
          addRandomSuffix: false,
          tokenPayload: clientPayload,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        if (process.env.NODE_ENV === "development") {
          const importSessionId = parseImportSessionId(tokenPayload);
          console.info("[ITI Blob]", {
            importSessionId,
            pathname: blob.pathname,
            contentType: blob.contentType,
            status: "uploaded",
          });
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Blob upload authorization failed.";

    if (process.env.NODE_ENV === "development") {
      console.info("[ITI Blob]", {
        status: "failed",
        error: message,
      });
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
