import { notFound } from "next/navigation";

import { SchemaBehindNotice } from "@/components/design-system/feedback/schema-behind-notice";
import { TransactionWorkspace } from "@/features/transactions/components/workspace/transaction-workspace";
import { getTransactionSchemaWarning } from "@/db/schema-compatibility";
import { getTransactionWorkspace } from "@/services/transactions/queries";

export const dynamic = "force-dynamic";

type TransactionWorkspaceRoutePageProps = {
  params: Promise<{ id: string }>;
};

export default async function TransactionWorkspaceRoutePage({
  params,
}: TransactionWorkspaceRoutePageProps) {
  const schemaWarning = await getTransactionSchemaWarning();

  if (schemaWarning) {
    return <SchemaBehindNotice message={schemaWarning} />;
  }

  const { id } = await params;
  const workspace = await getTransactionWorkspace(id);

  if (!workspace) {
    notFound();
  }

  return <TransactionWorkspace workspace={workspace} />;
}
