"use server";

import { detectDocumentType } from "@/services/ai-extraction/mock-extractor";
import { extractTextFromUploads } from "@/services/ai-extraction/pdf-text";
import { extractPurchaseAgreement, getExtractionSetupMessage } from "@/services/ai-extraction/purchase-agreement-extractor";
import type { PurchaseAgreementExtraction } from "@/services/ai-extraction/types";
import { createAiExtractionRecord } from "@/services/ai-extractions/mutations";
import { createDocumentRecord } from "@/services/documents/mutations";
import { storeUploadedFile } from "@/services/document-storage";

export type ExtractDocumentsResult = {
  extractionId: string;
  documentIds: string[];
  extraction: PurchaseAgreementExtraction;
  setupMessage?: string;
};

export async function extractTransactionDocumentsAction(
  formData: FormData,
): Promise<ExtractDocumentsResult> {
  const purchaseAgreement = formData.get("purchaseAgreement");
  const useMock = formData.get("useMock") === "true";

  if (!(purchaseAgreement instanceof File) || purchaseAgreement.size === 0) {
    throw new Error("Purchase Agreement PDF is required.");
  }

  const supportingFiles = formData
    .getAll("supportingDocuments")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  const allFiles = [purchaseAgreement, ...supportingFiles];
  const storedDocuments = [];
  const documentIds: string[] = [];

  for (const file of allFiles) {
    const documentType = detectDocumentType(file.name);
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
      fileName: record.fileName,
      fileType: record.fileType,
      fileSize: record.fileSize,
      documentType,
      storagePath: record.storagePath,
    });
  }

  const documentText = await extractTextFromUploads(storedDocuments);

  const { extraction, rawJson } = await extractPurchaseAgreement({
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
    setupMessage: extraction.setupMessage ?? getExtractionSetupMessage(),
  };
}
