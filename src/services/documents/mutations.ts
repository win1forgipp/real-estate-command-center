import "server-only";

import { eq, inArray } from "drizzle-orm";

import { getDb } from "@/db/client";
import { documents } from "@/db/schema";
import type { ItiDocumentType } from "@/services/iti/types";

export type CreateDocumentInput = {
  transactionId?: string;
  importSessionId?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  blobUrl?: string;
  blobPathname?: string;
  documentType: ItiDocumentType;
  extractedSummary?: string;
  confidenceScore?: number;
  processingStatus?: "temporary" | "confirmed";
};

export async function createDocumentRecord(input: CreateDocumentInput) {
  const db = getDb();

  const [document] = await db
    .insert(documents)
    .values({
      transactionId: input.transactionId ?? null,
      importSessionId: input.importSessionId ?? null,
      fileName: input.fileName,
      fileType: input.fileType,
      fileSize: input.fileSize,
      storagePath: input.storagePath,
      blobUrl: input.blobUrl ?? null,
      blobPathname: input.blobPathname ?? null,
      documentType: input.documentType,
      extractedSummary: input.extractedSummary ?? null,
      confidenceScore: input.confidenceScore ?? null,
      processingStatus: input.processingStatus ?? "temporary",
    })
    .returning();

  return document;
}

export async function linkDocumentsToTransaction(
  documentIds: string[],
  transactionId: string,
) {
  const db = getDb();

  for (const documentId of documentIds) {
    await db
      .update(documents)
      .set({ transactionId, updatedAt: new Date() })
      .where(eq(documents.id, documentId));
  }
}

export async function confirmDocumentsForTransaction(
  documentIds: string[],
  transactionId: string,
  summaries?: Record<string, { summary?: string; confidenceScore?: number }>,
) {
  const db = getDb();

  for (const documentId of documentIds) {
    const summary = summaries?.[documentId];
    await db
      .update(documents)
      .set({
        transactionId,
        processingStatus: "confirmed",
        extractedSummary: summary?.summary ?? null,
        confidenceScore: summary?.confidenceScore ?? null,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));
  }
}

export async function updateDocumentExtractionMetadata(
  documentIds: string[],
  summaries: Record<string, { summary?: string; confidenceScore?: number }>,
) {
  const db = getDb();

  for (const documentId of documentIds) {
    const summary = summaries[documentId];
    if (!summary) {
      continue;
    }

    await db
      .update(documents)
      .set({
        extractedSummary: summary.summary ?? null,
        confidenceScore: summary.confidenceScore ?? null,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));
  }
}

export async function getDocumentsByIds(documentIds: string[]) {
  if (!documentIds.length) {
    return [];
  }

  const db = getDb();
  return db.select().from(documents).where(inArray(documents.id, documentIds));
}
