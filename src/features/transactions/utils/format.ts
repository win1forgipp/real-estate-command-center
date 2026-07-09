import type { TransactionDto } from "@/features/transactions/types";

const transactionTypeLabels: Record<TransactionDto["transactionType"], string> = {
  buyer: "Buyer",
  seller: "Seller",
  dual: "Dual",
};

export function formatPropertyAddress(transaction: TransactionDto) {
  return `${transaction.propertyAddress}, ${transaction.city}, ${transaction.state} ${transaction.zip}`;
}

export function formatTransactionType(transaction: TransactionDto) {
  return transactionTypeLabels[transaction.transactionType];
}

export function formatDateValue(value: Date | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function formatCurrencyValue(value: number | null | undefined) {
  if (value == null) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatClientPlaceholder(transaction: TransactionDto) {
  if (transaction.transactionType === "buyer") {
    return "Buyer not linked yet";
  }

  if (transaction.transactionType === "seller") {
    return "Seller not linked yet";
  }

  return "Buyer and seller not linked yet";
}
