import { notInArray } from "drizzle-orm";

import { transactions } from "@/db/schema";

export const INACTIVE_TRANSACTION_STATUSES = ["closed", "cancelled"] as const;

export function activeTransactionsFilter() {
  return notInArray(transactions.transactionStatus, [
    ...INACTIVE_TRANSACTION_STATUSES,
  ]);
}

export function isActiveTransactionStatus(status: string) {
  return !INACTIVE_TRANSACTION_STATUSES.includes(
    status as (typeof INACTIVE_TRANSACTION_STATUSES)[number],
  );
}
