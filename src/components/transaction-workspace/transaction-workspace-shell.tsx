"use client";

import { PageHeader } from "@/components/design-system/layout/page-header";
import { PageContainer } from "@/components/design-system/layout/page-container";
import { typography } from "@/lib/design-system/typography";
import type { MockTransactionWorkspace } from "@/lib/transaction-progress/mock-progress";
import { cn } from "@/lib/utils";

import { TransactionProgressTracker } from "./transaction-progress-tracker";

const workspaceTabs = [
  "Overview",
  "Contacts",
  "Timeline",
  "Tasks",
  "Deadlines",
  "Documents",
  "Notes",
  "Commission",
] as const;

type TransactionWorkspaceShellProps = {
  workspace: MockTransactionWorkspace;
  className?: string;
};

export function TransactionWorkspaceShell({
  workspace,
  className,
}: TransactionWorkspaceShellProps) {
  return (
    <PageContainer className={className}>
      <PageHeader title={workspace.title} subtitle={workspace.subtitle} />

      <TransactionProgressTracker
        transactionType={workspace.transactionType}
        progress={workspace.progress}
      />

      <section className="rounded-2xl border border-border/70 bg-card shadow-sm">
        <div className="flex gap-1 overflow-x-auto border-b border-border/70 p-2">
          {workspaceTabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={cn(
                "min-h-11 shrink-0 rounded-lg px-4 text-sm font-medium transition-colors",
                index === 0
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-5 md:p-6">
          <p className={typography.bodyMuted}>
            Workspace tabs are placeholders. Overview content will connect to
            live transaction data in a future milestone.
          </p>
        </div>
      </section>
    </PageContainer>
  );
}
