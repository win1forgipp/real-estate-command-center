"use client";

import { StatusBadge } from "@/components/design-system/badges/status-badge";
import type { ConfidenceLevel } from "@/services/ai-extraction/types";

const confidenceConfig: Record<
  ConfidenceLevel,
  { label: string; variant: "success" | "warning" | "danger" | "default" }
> = {
  high: { label: "High confidence", variant: "success" },
  medium: { label: "Medium confidence", variant: "warning" },
  low: { label: "Low confidence", variant: "warning" },
  missing: { label: "Missing", variant: "default" },
};

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const config = confidenceConfig[level];
  return <StatusBadge label={config.label} variant={config.variant} className="shrink-0" />;
}
