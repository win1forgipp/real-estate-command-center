"use server";

import { revalidatePath } from "next/cache";

import {
  importReviewSchema,
  type ImportReviewInput,
} from "@/features/transactions/schemas/import-transaction-schema";
import { createTransactionFromImport } from "@/services/import/mutations";

export async function importTransactionAction(input: {
  review: ImportReviewInput;
  documentIds: string[];
  extractionId: string;
  importAsArchived: boolean;
  documentSummaries?: Record<string, { summary?: string; confidenceScore?: number }>;
}) {
  const review = importReviewSchema.parse(input.review);

  const result = await createTransactionFromImport({
    review,
    documentIds: input.documentIds,
    extractionId: input.extractionId,
    importAsArchived: input.importAsArchived,
    documentSummaries: input.documentSummaries,
  });

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath(`/transactions/${result.id}`);

  return result;
}
