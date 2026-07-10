import { Suspense } from "react";

import { SchemaBehindNotice } from "@/components/design-system/feedback/schema-behind-notice";
import { TransactionsPage } from "@/features/transactions/components/transactions-page";
import { LoadingState } from "@/components/design-system/feedback/loading-state";
import { getTransactionSchemaWarning } from "@/db/schema-compatibility";
import { getTransactionsList } from "@/services/transactions/queries";
import { getUsersList } from "@/services/users/queries";

export const dynamic = "force-dynamic";

async function TransactionsPageLoader() {
  const schemaWarning = await getTransactionSchemaWarning();

  if (schemaWarning) {
    return <SchemaBehindNotice message={schemaWarning} />;
  }

  const [transactions, agents] = await Promise.all([
    getTransactionsList(),
    getUsersList(),
  ]);

  return <TransactionsPage transactions={transactions} agents={agents} />;
}

export default function TransactionsRoutePage() {
  return (
    <Suspense
      fallback={
        <LoadingState
          title="Loading transactions"
          description="Fetching your transaction list..."
        />
      }
    >
      <TransactionsPageLoader />
    </Suspense>
  );
}
