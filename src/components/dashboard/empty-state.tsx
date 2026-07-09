"use client";

import {
  EmptyState as DesignSystemEmptyState,
} from "@/components/design-system/feedback/empty-state";
import type { PageAction } from "@/lib/page-config";

type EmptyStateProps = {
  icon: React.ComponentProps<typeof DesignSystemEmptyState>["icon"];
  title: string;
  description: string;
  primaryAction: PageAction;
  helpText: string;
  className?: string;
};

export function EmptyState({
  primaryAction,
  ...props
}: EmptyStateProps) {
  return (
    <DesignSystemEmptyState
      {...props}
      actionLabel={primaryAction.label}
    />
  );
}
