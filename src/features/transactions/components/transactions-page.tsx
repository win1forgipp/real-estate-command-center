"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { PageContainer } from "@/components/design-system/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { NewTransactionWizard } from "@/features/transactions/components/new-transaction-wizard/new-transaction-wizard";
import { TransactionsTable } from "@/features/transactions/components/transactions-table";
import { subscribeToAppActionEvent } from "@/lib/app-actions/events";
import type { TransactionListItem, UserDto } from "@/features/transactions/types";

type TransactionsPageProps = {
  transactions: TransactionListItem[];
  agents: UserDto[];
};

export function TransactionsPage({ transactions, agents }: TransactionsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setWizardOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    return subscribeToAppActionEvent("new_transaction", () => {
      setWizardOpen(true);
    });
  }, []);

  const handleWizardOpenChange = useCallback(
    (open: boolean) => {
      setWizardOpen(open);

      if (!open && searchParams.get("new") === "1") {
        router.replace("/transactions");
      }
    },
    [router, searchParams],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Transactions"
        subtitle="Track buyer and seller deals from contract to closing."
        primaryAction={{ actionId: "new_transaction" }}
      />
      <TransactionsTable transactions={transactions} />
      <NewTransactionWizard
        open={wizardOpen}
        onOpenChange={handleWizardOpenChange}
        agents={agents}
      />
    </PageContainer>
  );
}
