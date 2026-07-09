import { StatusBadge } from "@/components/design-system/badges/status-badge";

const priorityConfig = {
  low: { label: "Low", variant: "default" as const },
  medium: { label: "Medium", variant: "info" as const },
  high: { label: "High", variant: "warning" as const },
  urgent: { label: "Urgent", variant: "danger" as const },
};

type Priority = keyof typeof priorityConfig;

type PriorityBadgeProps = {
  priority: Priority;
  className?: string;
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  return (
    <StatusBadge
      label={config.label}
      variant={config.variant}
      className={className}
    />
  );
}
