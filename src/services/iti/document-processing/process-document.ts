import "server-only";

import { fetchBlobDocumentBuffer } from "@/services/iti/blob-fetch";
import { getItiPdfProcessingMode } from "@/services/iti/openai/config";
import { assessTextQuality } from "@/services/iti/document-processing/assess-text-quality";
import { MAX_VISION_PAGES } from "@/services/iti/document-processing/constants";
import { extractImageWithVision, extractWithVision } from "@/services/iti/document-processing/extract-with-vision";
import { extractPdfEmbeddedText } from "@/services/iti/document-processing/extract-pdf-text";
import { renderPdfPages } from "@/services/iti/document-processing/render-pdf-pages";
import type { ItiDocumentProcessingResult } from "@/services/iti/document-processing/types";

const DOCUMENT_READ_FAILURE_MESSAGE =
  "ITI could not read this document after both text extraction and scanned-document analysis.";

function getExtension(fileName: string) {
  const lower = fileName.toLowerCase();
  const dotIndex = lower.lastIndexOf(".");
  return dotIndex >= 0 ? lower.slice(dotIndex) : "";
}

function isHeicLike(fileName: string, fileType: string) {
  const extension = getExtension(fileName);
  return (
    extension === ".heic" ||
    extension === ".heif" ||
    fileType === "image/heic" ||
    fileType === "image/heif"
  );
}

function isPdf(fileName: string, fileType: string) {
  return fileType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");
}

function isImage(fileName: string, fileType: string) {
  if (fileType.startsWith("image/")) {
    return true;
  }

  const extension = getExtension(fileName);
  return extension === ".jpg" || extension === ".jpeg" || extension === ".png";
}

function confidenceForMethod(method: ItiDocumentProcessingResult["method"]) {
  if (method === "embedded_text") {
    return 92;
  }

  if (method === "vision") {
    return 78;
  }

  return 75;
}

export async function processDocument(input: {
  fileName: string;
  fileType: string;
  buffer: Buffer;
  useMock?: boolean;
}): Promise<ItiDocumentProcessingResult> {
  const warnings: string[] = [];

  if (isHeicLike(input.fileName, input.fileType)) {
    throw new Error(
      "HEIC/HEIF images are not supported for scanned-document analysis yet. Convert to JPEG or PNG and re-upload.",
    );
  }

  if (isImage(input.fileName, input.fileType)) {
    const mimeType =
      input.fileType === "image/png" || input.fileName.toLowerCase().endsWith(".png")
        ? "image/png"
        : "image/jpeg";

    const text = await extractImageWithVision({
      buffer: input.buffer,
      mimeType,
      fileName: input.fileName,
      useMock: input.useMock,
    });

    if (!assessTextQuality(text).isUsable) {
      throw new Error(DOCUMENT_READ_FAILURE_MESSAGE);
    }

    return {
      fileName: input.fileName,
      text,
      method: "vision",
      pageCount: 1,
      warnings,
      confidence: confidenceForMethod("vision"),
    };
  }

  if (isPdf(input.fileName, input.fileType)) {
    const embedded = await extractPdfEmbeddedText(input.buffer);
    const embeddedQuality = assessTextQuality(embedded.text);

    if (embeddedQuality.isUsable) {
      return {
        fileName: input.fileName,
        text: embedded.text,
        method: "embedded_text",
        pageCount: embedded.pageCount,
        warnings,
        confidence: confidenceForMethod("embedded_text"),
      };
    }

    warnings.push("Embedded PDF text was insufficient; running scanned-document analysis.");

    if (getItiPdfProcessingMode() !== "legacy_render") {
      throw new Error(
        "Scanned PDF rendering is disabled. Set ITI_PDF_PROCESSING_MODE=legacy_render for diagnostics or use openai_file in production.",
      );
    }

    const pages = await renderPdfPages(input.buffer, { maxPages: MAX_VISION_PAGES });
    if (!pages.length) {
      throw new Error(DOCUMENT_READ_FAILURE_MESSAGE);
    }

    if (embedded.pageCount > MAX_VISION_PAGES) {
      warnings.push(
        `Only the first ${MAX_VISION_PAGES} of ${embedded.pageCount} pages were analyzed for this document.`,
      );
    }

    const visionText = await extractWithVision({
      pages,
      fileName: input.fileName,
      useMock: input.useMock,
    });

    if (!assessTextQuality(visionText).isUsable) {
      throw new Error(DOCUMENT_READ_FAILURE_MESSAGE);
    }

    return {
      fileName: input.fileName,
      text: visionText,
      method: "vision",
      pageCount: pages.length,
      warnings,
      confidence: confidenceForMethod("vision"),
    };
  }

  throw new Error("Unsupported document type for ITI processing.");
}

export async function processDocumentFromBlob(input: {
  fileName: string;
  fileType: string;
  fileSize: number;
  blobUrl: string;
  useMock?: boolean;
}) {
  const { buffer } = await fetchBlobDocumentBuffer(input.blobUrl, input.fileSize);
  return processDocument({
    fileName: input.fileName,
    fileType: input.fileType,
    buffer,
    useMock: input.useMock,
  });
}

export async function processUploadedBlobDocuments(
  files: {
    fileName: string;
    fileType: string;
    fileSize: number;
    blobUrl: string;
  }[],
  options?: { useMock?: boolean },
) {
  const results: ItiDocumentProcessingResult[] = [];
  const failures: Array<{ fileName: string; error: string }> = [];

  for (const file of files) {
    try {
      const result = await processDocumentFromBlob({
        ...file,
        useMock: options?.useMock,
      });
      results.push(result);
    } catch (error) {
      failures.push({
        fileName: file.fileName,
        error:
          error instanceof Error
            ? error.message
            : DOCUMENT_READ_FAILURE_MESSAGE,
      });
    }
  }

  const documentText = results
    .map((result) => `--- ${result.fileName} ---\n${result.text}`)
    .join("\n\n");

  return {
    documentText,
    results,
    failures,
  };
}
