"use client";

import {
  EmptyState as DesignSystemEmptyState,
} from "@/components/design-system/feedback/empty-state";
import { getActionLabel } from "@/lib/app-actions";
import { useAppAction } from "@/lib/app-actions/use-app-action";
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
  const { getActionProps } = useAppAction();
  const actionProps = getActionProps(primaryAction.actionId);

  return (
    <DesignSystemEmptyState
      {...props}
      actionLabel={getActionLabel(primaryAction.actionId)}
      onAction={actionProps.onClick}
    />
  );
}
