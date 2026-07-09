import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { aiExtractions } from "@/db/schema";

export async function createAiExtractionRecord(input: {
  sourceDocumentIds: string[];
  extractedJson: string;
  confidenceScore?: number;
}) {
  const db = getDb();

  const [record] = await db
    .insert(aiExtractions)
    .values({
      sourceDocumentIds: JSON.stringify(input.sourceDocumentIds),
      extractedJson: input.extractedJson,
      confidenceScore: input.confidenceScore ?? null,
      status: "pending_review",
    })
    .returning();

  return record;
}

export async function acceptAiExtraction(extractionId: string, transactionId: string) {
  const db = getDb();

  await db
    .update(aiExtractions)
    .set({
      transactionId,
      status: "accepted",
      updatedAt: new Date(),
    })
    .where(eq(aiExtractions.id, extractionId));
}
