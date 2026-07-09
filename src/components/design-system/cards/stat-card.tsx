import type { LucideIcon } from "lucide-react";

import { StatusBadge, type StatusVariant } from "@/components/design-system/badges/status-badge";
import { typography } from "@/lib/design-system/typography";
import { cn } from "@/lib/utils";

type StatCardProps = {
  icon: LucideIcon;
  title: string;
  value: string;
  description?: string;
  statusLabel?: string;
  statusVariant?: StatusVariant;
  className?: string;
};

export function StatCard({
  icon: Icon,
  title,
  value,
  description,
  statusLabel,
  statusVariant = "default",
  className,
}: StatCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className={typography.cardTitle}>{title}</h3>
            {description ? (
              <p className={cn(typography.caption, "mt-1")}>{description}</p>
            ) : null}
          </div>
        </div>
        {statusLabel ? (
          <StatusBadge label={statusLabel} variant={statusVariant} />
        ) : null}
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
    </section>
  );
}
