"use client";

import { notFound, useParams } from "next/navigation";

import { TransactionWorkspaceShell } from "@/components/transaction-workspace";
import { getMockTransactionWorkspace } from "@/lib/transaction-progress";

export default function TransactionWorkspacePage() {
  const params = useParams<{ id: string }>();
  const workspace = getMockTransactionWorkspace(params.id);

  if (!workspace) {
    notFound();
  }

  return <TransactionWorkspaceShell workspace={workspace} />;
}
