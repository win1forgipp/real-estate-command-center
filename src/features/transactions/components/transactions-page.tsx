"use client";

import { PageContainer } from "@/components/design-system/layout/page-container";
import { PageHeader } from "@/components/design-system/layout/page-header";
import { notify } from "@/components/design-system/notifications/toast";
import { TransactionsTable } from "@/features/transactions/components/transactions-table";
import type { TransactionListItem } from "@/features/transactions/types";

type TransactionsPageProps = {
  transactions: TransactionListItem[];
};

export function TransactionsPage({ transactions }: TransactionsPageProps) {
  return (
    <PageContainer>
      <PageHeader
        title="Transactions"
        subtitle="Track buyer and seller deals from contract to closing."
        primaryAction={{
          label: "New Transaction",
          onClick: () =>
            notify.info(
              "Coming soon",
              "New transaction creation will be added in a future milestone.",
            ),
        }}
      />
      <TransactionsTable transactions={transactions} />
    </PageContainer>
  );
}
