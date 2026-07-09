"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import {
  DataTable,
  type DataTableColumn,
} from "@/components/design-system/tables/data-table";
import { TransactionStatusBadge } from "@/components/design-system/badges/transaction-status-badge";
import type { TransactionListItem } from "@/features/transactions/types";

type TransactionsTableProps = {
  transactions: TransactionListItem[];
};

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const router = useRouter();

  const columns = useMemo<DataTableColumn<TransactionListItem>[]>(
    () => [
      {
        id: "propertyAddress",
        header: "Property Address",
        accessorKey: "propertyAddress",
        sortable: true,
      },
      {
        id: "client",
        header: "Client",
        accessorKey: "client",
        sortable: true,
        hideOnMobile: true,
      },
      {
        id: "transactionType",
        header: "Transaction Type",
        accessorKey: "transactionType",
        sortable: true,
      },
      {
        id: "status",
        header: "Status",
        cell: (row) => <TransactionStatusBadge status={row.status} />,
        sortable: true,
        accessorKey: "status",
      },
      {
        id: "contractDate",
        header: "Contract Date",
        accessorKey: "contractDate",
        sortable: true,
        hideOnMobile: true,
      },
      {
        id: "closingDate",
        header: "Closing Date",
        accessorKey: "closingDate",
        sortable: true,
        hideOnMobile: true,
      },
      {
        id: "nextDeadline",
        header: "Next Deadline",
        accessorKey: "nextDeadline",
        sortable: true,
      },
      {
        id: "assignedAgent",
        header: "Assigned Agent",
        accessorKey: "assignedAgent",
        sortable: true,
        hideOnMobile: true,
      },
    ],
    [],
  );

  return (
    <DataTable
      data={transactions}
      columns={columns}
      searchPlaceholder="Search transactions..."
      emptyMessage="No transactions found."
      onRowClick={(row) => router.push(`/transactions/${row.id}`)}
      filterFn={(row, query) => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) {
          return true;
        }

        return [
          row.propertyAddress,
          row.client,
          row.transactionType,
          row.status,
          row.assignedAgent,
          row.nextDeadline,
        ].some((value) => value.toLowerCase().includes(normalized));
      }}
    />
  );
}
