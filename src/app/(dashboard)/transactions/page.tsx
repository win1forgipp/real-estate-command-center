import { TransactionsPage } from "@/features/transactions/components/transactions-page";
import { getTransactionsList } from "@/services/transactions/queries";
import { getUsersList } from "@/services/users/queries";

export const dynamic = "force-dynamic";

export default async function TransactionsRoutePage() {
  const [transactions, agents] = await Promise.all([
    getTransactionsList(),
    getUsersList(),
  ]);

  return <TransactionsPage transactions={transactions} agents={agents} />;
}
