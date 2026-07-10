import { typography } from "@/lib/design-system/typography";
import { formatPercentFromBps } from "@/lib/formatting/commission";
import { cn } from "@/lib/utils";

type PercentDisplayProps = {
  bps?: number | null;
  percent?: number | null;
  className?: string;
};

export function PercentDisplay({ bps, percent, className }: PercentDisplayProps) {
  const formatted =
    bps != null
      ? formatPercentFromBps(bps)
      : percent != null
        ? `${percent.toString().replace(/\.?0+$/, "")}%`
        : "—";

  return <span className={cn(typography.label, className)}>{formatted}</span>;
}
