"use client";

import { PageContainer } from "@/components/design-system/layout/page-container";
import { PageHeader } from "@/components/design-system/layout/page-header";
import { TransactionProgressTracker } from "@/components/transaction-workspace/transaction-progress-tracker";
import { SummaryPanel } from "@/features/transactions/components/workspace/summary-panel";
import { WorkspaceTabs } from "@/features/transactions/components/workspace/workspace-tabs";
import type { TransactionWorkspaceData } from "@/features/transactions/types";
import {
  formatPropertyAddress,
  formatTransactionType,
} from "@/features/transactions/utils/format";

type TransactionWorkspaceProps = {
  workspace: TransactionWorkspaceData;
};

export function TransactionWorkspace({ workspace }: TransactionWorkspaceProps) {
  const { transaction } = workspace;

  return (
    <PageContainer>
      <PageHeader
        title={formatPropertyAddress(transaction)}
        subtitle={`${formatTransactionType(transaction)} · ${transaction.transactionStatus.replaceAll("_", " ")}`}
      />

      <TransactionProgressTracker
        transactionType={workspace.progressType}
        progress={workspace.progress}
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <SummaryPanel workspace={workspace} />
        <WorkspaceTabs workspace={workspace} />
      </div>
    </PageContainer>
  );
}
