import type { ItiDocumentProcessingMethod } from "@/services/iti/types";

export type { ItiDocumentProcessingMethod };

export type ItiDocumentProcessingResult = {
  fileName: string;
  text: string;
  method: ItiDocumentProcessingMethod;
  pageCount: number;
  warnings: string[];
  confidence: number;
};

export type RenderedDocumentPage = {
  pageNumber: number;
  buffer: Buffer;
  mimeType: "image/png" | "image/jpeg";
};
