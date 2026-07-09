"use server";

import { detectItiDocumentType, parseUploadedDocuments, runItiExtraction } from "@/services/iti";
import type { ItiExtractionResult } from "@/services/iti/types";
import { createAiExtractionRecord } from "@/services/ai-extractions/mutations";
import { createDocumentRecord } from "@/services/documents/mutations";
import { storeUploadedFile } from "@/services/document-storage";

export type RunItiResult = {
  extractionId: string;
  documentIds: string[];
  extraction: ItiExtractionResult;
  setupMessage?: string;
};

export async function runItiExtractionAction(formData: FormData): Promise<RunItiResult> {
  const uploadedFiles = formData
    .getAll("documents")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!uploadedFiles.length) {
    throw new Error("Add at least one document to run ITI.");
  }

  const useMock = formData.get("useMock") === "true";
  const storedDocuments = [];
  const documentIds: string[] = [];

  for (const file of uploadedFiles) {
    const documentType = detectItiDocumentType(file.name);
    const stored = await storeUploadedFile(file, documentType);
    const record = await createDocumentRecord({
      fileName: stored.fileName,
      fileType: stored.fileType,
      fileSize: stored.fileSize,
      storagePath: stored.storagePath,
      documentType,
    });
    documentIds.push(record.id);
    storedDocuments.push({
      id: record.id,
      fileName: stored.fileName,
      fileType: stored.fileType,
      fileSize: stored.fileSize,
      documentType,
      storagePath: stored.storagePath,
    });
  }

  const documentText = await parseUploadedDocuments(storedDocuments);

  const { extraction, rawJson } = await runItiExtraction({
    documents: storedDocuments,
    documentText,
    useMock,
  });

  const extractionRecord = await createAiExtractionRecord({
    sourceDocumentIds: documentIds,
    extractedJson: rawJson,
    confidenceScore: extraction.overallConfidence,
  });

  return {
    extractionId: extractionRecord.id,
    documentIds,
    extraction,
    setupMessage: extraction.setupMessage,
  };
}

/** @deprecated Use runItiExtractionAction */
export const extractTransactionDocumentsAction = runItiExtractionAction;
export type ExtractDocumentsResult = RunItiResult;
