import "server-only";

import { VISION_PAGE_BATCH_SIZE } from "@/services/iti/document-processing/constants";
import type { RenderedDocumentPage } from "@/services/iti/document-processing/types";

function chunkPages<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function buildMockVisionText(fileName: string, pageCount: number) {
  return [
    `SCANNED DOCUMENT ANALYSIS (MOCK)`,
    `Source: ${fileName}`,
    `Pages analyzed: ${pageCount}`,
    "",
    "Residential Purchase Agreement",
    "Property Address: 142 Oak Lane",
    "City: Richmond",
    "State: VA",
    "Zip: 23220",
    "Purchase Price: $425,000",
    "Contract Date: 2026-03-15",
    "Closing Date: 2026-05-01",
    "Buyer: Alex Morgan and Jamie Morgan",
    "Seller: Taylor Brooks",
    "Earnest Money: $5,000 held by listing brokerage",
    "Inspection Deadline: 2026-03-22",
    "Financing Deadline: 2026-04-05",
  ].join("\n");
}

export async function extractWithVision(input: {
  pages: RenderedDocumentPage[];
  fileName: string;
  useMock?: boolean;
}) {
  if (!input.pages.length) {
    throw new Error("No document pages were available for scanned-document analysis.");
  }

  if (input.useMock) {
    return buildMockVisionText(input.fileName, input.pages.length);
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return buildMockVisionText(input.fileName, input.pages.length);
  }

  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey });
  const batches = chunkPages(input.pages, VISION_PAGE_BATCH_SIZE);
  const pageTexts: string[] = [];

  for (const batch of batches) {
    const content: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string; detail: "high" } }
    > = [
      {
        type: "text",
        text: [
          `Extract all readable text from these real estate document page(s) from "${input.fileName}".`,
          "Return plain text only.",
          "Preserve headings, labels, values, dates, addresses, and currency amounts.",
          "Separate pages with a line containing \"--- page N ---\".",
        ].join(" "),
      },
      ...batch.map((page) => ({
        type: "image_url" as const,
        image_url: {
          url: `data:${page.mimeType};base64,${page.buffer.toString("base64")}`,
          detail: "high" as const,
        },
      })),
    ];

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content }],
      max_tokens: 4096,
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (text) {
      pageTexts.push(text);
    }
  }

  return pageTexts.join("\n\n").trim();
}

export async function extractImageWithVision(input: {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  useMock?: boolean;
}) {
  return extractWithVision({
    fileName: input.fileName,
    useMock: input.useMock,
    pages: [
      {
        pageNumber: 1,
        buffer: input.buffer,
        mimeType: input.mimeType === "image/png" ? "image/png" : "image/jpeg",
      },
    ],
  });
}
