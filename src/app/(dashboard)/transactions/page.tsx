import { notFound } from "next/navigation";

import { TransactionsPage } from "@/features/transactions/components/transactions-page";
import { getTransactionsList } from "@/services/transactions/queries";

export const dynamic = "force-dynamic";

export default async function TransactionsRoutePage() {
  const transactions = await getTransactionsList();

  return <TransactionsPage transactions={transactions} />;
}
