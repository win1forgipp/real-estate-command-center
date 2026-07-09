import { notFound } from "next/navigation";

import { TransactionWorkspace } from "@/features/transactions/components/workspace/transaction-workspace";
import { getTransactionWorkspace } from "@/services/transactions/queries";

export const dynamic = "force-dynamic";

type TransactionWorkspaceRoutePageProps = {
  params: Promise<{ id: string }>;
};

export default async function TransactionWorkspaceRoutePage({
  params,
}: TransactionWorkspaceRoutePageProps) {
  const { id } = await params;
  const workspace = await getTransactionWorkspace(id);

  if (!workspace) {
    notFound();
  }

  return <TransactionWorkspace workspace={workspace} />;
}
