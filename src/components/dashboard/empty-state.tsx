"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import {
  EmptyState as DesignSystemEmptyState,
} from "@/components/design-system/feedback/empty-state";
import { getActionClickHandler } from "@/lib/create-actions";
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
  const router = useRouter();
  const navigate = useCallback((href: string) => router.push(href), [router]);

  return (
    <DesignSystemEmptyState
      {...props}
      actionLabel={primaryAction.label}
      onAction={getActionClickHandler(
        primaryAction.label,
        navigate,
        primaryAction.onClick,
      )}
    />
  );
}
