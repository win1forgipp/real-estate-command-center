import { StatusBadge } from "@/components/design-system/badges/status-badge";

const transactionStatusConfig = {
  prospect: { label: "Prospect", variant: "default" as const },
  under_contract: { label: "Under Contract", variant: "info" as const },
  inspection: { label: "Inspection", variant: "warning" as const },
  appraisal: { label: "Appraisal", variant: "warning" as const },
  financing: { label: "Financing", variant: "info" as const },
  closing: { label: "Closing", variant: "success" as const },
  closed: { label: "Closed", variant: "success" as const },
  cancelled: { label: "Cancelled", variant: "danger" as const },
  archived: { label: "Archived", variant: "default" as const },
};

export type TransactionStatus = keyof typeof transactionStatusConfig;

type TransactionStatusBadgeProps = {
  status: TransactionStatus;
  className?: string;
};

export function TransactionStatusBadge({
  status,
  className,
}: TransactionStatusBadgeProps) {
  const config = transactionStatusConfig[status];
  return (
    <StatusBadge
      label={config.label}
      variant={config.variant}
      className={className}
    />
  );
}
