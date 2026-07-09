"use client";

import { useState } from "react";

import { PageContainer } from "@/components/design-system/layout/page-container";
import { PageHeader } from "@/components/design-system/layout/page-header";
import { NewTransactionWizard } from "@/features/transactions/components/new-transaction-wizard/new-transaction-wizard";
import { TransactionsTable } from "@/features/transactions/components/transactions-table";
import type { TransactionListItem, UserDto } from "@/features/transactions/types";

type TransactionsPageProps = {
  transactions: TransactionListItem[];
  agents: UserDto[];
};

export function TransactionsPage({ transactions, agents }: TransactionsPageProps) {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <PageContainer>
      <PageHeader
        title="Transactions"
        subtitle="Track buyer and seller deals from contract to closing."
        primaryAction={{
          label: "New Transaction",
          onClick: () => setWizardOpen(true),
        }}
      />
      <TransactionsTable transactions={transactions} />
      <NewTransactionWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        agents={agents}
      />
    </PageContainer>
  );
}
