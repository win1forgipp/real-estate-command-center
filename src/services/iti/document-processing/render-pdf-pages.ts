import "server-only";

import {
  MAX_VISION_PAGES,
  VISION_IMAGE_MAX_WIDTH,
} from "@/services/iti/document-processing/constants";
import type { RenderedDocumentPage } from "@/services/iti/document-processing/types";

export async function renderPdfPages(
  buffer: Buffer,
  options?: { maxPages?: number },
): Promise<RenderedDocumentPage[]> {
  const maxPages = options?.maxPages ?? MAX_VISION_PAGES;
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getScreenshot({
      first: maxPages,
      desiredWidth: VISION_IMAGE_MAX_WIDTH,
      imageDataUrl: false,
      imageBuffer: true,
    });

    return result.pages.map((page) => ({
      pageNumber: page.pageNumber,
      buffer: Buffer.from(page.data),
      mimeType: "image/png" as const,
    }));
  } finally {
    await parser.destroy();
  }
}
