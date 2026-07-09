import { StatusBadge } from "@/components/design-system/badges/status-badge";

const deadlineStatusConfig = {
  due_today: { label: "Due Today", variant: "danger" as const },
  due_soon: { label: "Due Soon", variant: "warning" as const },
  overdue: { label: "Overdue", variant: "danger" as const },
  complete: { label: "Complete", variant: "success" as const },
};

export type DeadlineStatus = keyof typeof deadlineStatusConfig;

type DeadlineBadgeProps = {
  status: DeadlineStatus;
  className?: string;
};

export function DeadlineBadge({ status, className }: DeadlineBadgeProps) {
  const config = deadlineStatusConfig[status];
  return (
    <StatusBadge
      label={config.label}
      variant={config.variant}
      className={className}
    />
  );
}
