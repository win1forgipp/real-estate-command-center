"use client";

import {
  FileText,
  Pencil,
  Plus,
  Upload,
} from "lucide-react";

import {
  SecondaryButton,
} from "@/components/design-system/buttons/action-buttons";
import { TransactionStatusBadge } from "@/components/design-system/badges/transaction-status-badge";
import { CurrencyDisplay } from "@/components/design-system/displays/currency-display";
import { DateDisplay } from "@/components/design-system/displays/date-display";
import { PropertyAddress } from "@/components/design-system/displays/property-address";
import { getActionLabel } from "@/lib/app-actions";
import { useAppAction } from "@/lib/app-actions/use-app-action";
import { typography } from "@/lib/design-system/typography";
import type { TransactionWorkspaceData } from "@/features/transactions/types";
import {
  formatClientPlaceholder,
  formatTransactionType,
} from "@/features/transactions/utils/format";
import { cn } from "@/lib/utils";

type SummaryPanelProps = {
  workspace: TransactionWorkspaceData;
  className?: string;
};

function QuickActionButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  return (
    <SecondaryButton
      type="button"
      className="w-full justify-start"
      onClick={onClick}
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </SecondaryButton>
  );
}

export function SummaryPanel({ workspace, className }: SummaryPanelProps) {
  const { transaction, assignedUser } = workspace;
  const { getHandler } = useAppAction();

  return (
    <aside
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-5 shadow-sm",
        className,
      )}
    >
      <h3 className={typography.sectionTitle}>Summary</h3>

      <dl className="mt-5 space-y-4">
        <div>
          <dt className={typography.caption}>Property Address</dt>
          <dd className="mt-1">
            <PropertyAddress
              street={transaction.propertyAddress}
              city={transaction.city}
              state={transaction.state}
              zip={transaction.zip}
            />
          </dd>
        </div>

        <div>
          <dt className={typography.caption}>Status</dt>
          <dd className="mt-1">
            <TransactionStatusBadge status={transaction.transactionStatus} />
          </dd>
        </div>

        <div>
          <dt className={typography.caption}>Transaction Type</dt>
          <dd className={cn(typography.body, "mt-1")}>
            {formatTransactionType(transaction)}
          </dd>
        </div>

        <div>
          <dt className={typography.caption}>Closing Date</dt>
          <dd className="mt-1">
            {transaction.closingDate ? (
              <DateDisplay value={transaction.closingDate} />
            ) : (
              <span className={typography.bodyMuted}>—</span>
            )}
          </dd>
        </div>

        <div>
          <dt className={typography.caption}>Purchase Price</dt>
          <dd className="mt-1">
            {transaction.purchasePrice != null ? (
              <CurrencyDisplay amount={transaction.purchasePrice} />
            ) : (
              <span className={typography.bodyMuted}>—</span>
            )}
          </dd>
        </div>

        <div>
          <dt className={typography.caption}>Expected Commission</dt>
          <dd className="mt-1">
            {transaction.commissionExpected != null ? (
              <CurrencyDisplay amount={transaction.commissionExpected} />
            ) : (
              <span className={typography.bodyMuted}>—</span>
            )}
          </dd>
        </div>

        <div>
          <dt className={typography.caption}>Assigned Agent</dt>
          <dd className={cn(typography.body, "mt-1")}>
            {assignedUser?.name ?? "Unassigned"}
          </dd>
        </div>

        <div>
          <dt className={typography.caption}>Buyer</dt>
          <dd className={cn(typography.bodyMuted, "mt-1")}>
            {formatClientPlaceholder(transaction)}
          </dd>
        </div>

        <div>
          <dt className={typography.caption}>Seller</dt>
          <dd className={cn(typography.bodyMuted, "mt-1")}>
            Not linked yet
          </dd>
        </div>
      </dl>

      <div className="mt-6 space-y-2">
        <p className={typography.label}>Quick Actions</p>
        <QuickActionButton
          label={getActionLabel("edit_transaction")}
          icon={Pencil}
          onClick={getHandler("edit_transaction")}
        />
        <QuickActionButton
          label={getActionLabel("add_task")}
          icon={Plus}
          onClick={getHandler("add_task")}
        />
        <QuickActionButton
          label={getActionLabel("add_note")}
          icon={FileText}
          onClick={getHandler("add_note")}
        />
        <QuickActionButton
          label={getActionLabel("upload_document")}
          icon={Upload}
          onClick={getHandler("upload_document")}
        />
      </div>
    </aside>
  );
}
