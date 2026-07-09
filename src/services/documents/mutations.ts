import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { documents } from "@/db/schema";
import type { ItiDocumentType } from "@/services/iti/types";

export type CreateDocumentInput = {
  transactionId?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  documentType: ItiDocumentType;
  extractedSummary?: string;
  confidenceScore?: number;
};

export async function createDocumentRecord(input: CreateDocumentInput) {
  const db = getDb();

  const [document] = await db
    .insert(documents)
    .values({
      transactionId: input.transactionId ?? null,
      fileName: input.fileName,
      fileType: input.fileType,
      fileSize: input.fileSize,
      storagePath: input.storagePath,
      documentType: input.documentType,
      extractedSummary: input.extractedSummary ?? null,
      confidenceScore: input.confidenceScore ?? null,
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
