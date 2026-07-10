import { NextResponse } from "next/server";

import { extractItiFromBlobFiles } from "@/services/iti/extract-service";
import type { ItiExtractRequestBody } from "@/services/iti/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ItiExtractRequestBody;

    const result = await extractItiFromBlobFiles({
      importSessionId: body.importSessionId,
      files: body.files ?? [],
    });

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "ITI extraction request could not be processed.";

    return NextResponse.json(
      {
        ok: false,
        error: message,
        files: [],
      },
      { status: 400 },
    );
  }
}
