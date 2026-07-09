"use server";

import { revalidatePath } from "next/cache";

import {
  createTransactionInputSchema,
  type CreateTransactionInput,
} from "@/features/transactions/schemas/new-transaction-schema";
import { createTransaction } from "@/services/transactions/mutations";

export async function createTransactionAction(
  input: CreateTransactionInput,
): Promise<{ id: string }> {
  const validated = createTransactionInputSchema.parse(input);
  const result = await createTransaction(validated);

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath(`/transactions/${result.id}`);

  return result;
}
