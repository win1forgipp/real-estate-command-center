import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { notes, transactions } from "@/db/schema";
import type { CreateTransactionInput } from "@/features/transactions/schemas/new-transaction-schema";

function getSideFlags(transactionType: CreateTransactionInput["transactionType"]) {
  return {
    listingSide: transactionType === "seller" || transactionType === "dual",
    sellingSide: transactionType === "buyer" || transactionType === "dual",
  };
}

function buildInitialNoteContent(input: CreateTransactionInput) {
  const lines = ["Transaction created via New Transaction wizard."];

  if (input.buyerNames) {
    lines.push(`Buyer: ${input.buyerNames}`);
  }

  if (input.sellerNames) {
    lines.push(`Seller: ${input.sellerNames}`);
  }

  return lines.join("\n");
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<{ id: string }> {
  const db = getDb();
  const { listingSide, sellingSide } = getSideFlags(input.transactionType);
  const transactionStatus = input.contractDate ? "under_contract" : "prospect";

  const [transaction] = await db
    .insert(transactions)
    .values({
      transactionType: input.transactionType,
      propertyAddress: input.propertyAddress,
      city: input.city,
      state: input.state,
      zip: input.zip,
      purchasePrice: input.purchasePrice ?? null,
      closingDate: input.closingDate ? new Date(input.closingDate) : null,
      contractDate: input.contractDate ? new Date(input.contractDate) : null,
      earnestMoneyAmount: input.earnestMoneyAmount ?? null,
      earnestMoneyReceived: false,
      earnestMoneyHeldBy: input.earnestMoneyHeldBy ?? null,
      earnestMoneyHolderName: input.earnestMoneyHolderName ?? null,
      transactionStatus,
      listingSide,
      sellingSide,
      assignedUserId: input.assignedUserId,
    })
    .returning();

  await db.insert(notes).values({
    content: buildInitialNoteContent(input),
    noteScope: "transaction",
    transactionId: transaction.id,
    authorUserId: input.assignedUserId,
  });

  return { id: transaction.id };
}

export type UpdateCommissionInput = {
  transactionId: string;
  commissionExpected?: number;
  commissionReceived?: number;
};

export async function updateTransactionCommission(input: UpdateCommissionInput) {
  const db = getDb();

  const [transaction] = await db
    .update(transactions)
    .set({
      commissionExpected: input.commissionExpected ?? null,
      commissionReceived: input.commissionReceived ?? null,
      updatedAt: new Date(),
    })
    .where(eq(transactions.id, input.transactionId))
    .returning();

  return transaction;
}
