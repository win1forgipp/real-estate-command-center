"use client";

import {
  PageHeader as DesignSystemPageHeader,
} from "@/components/design-system/layout/page-header";
import type { PageAction } from "@/lib/page-config";

type PageHeaderProps = {
  title: string;
  subtitle: string;
  primaryAction?: PageAction;
  secondaryActions?: PageAction[];
  className?: string;
};

export function PageHeader({
  primaryAction,
  secondaryActions,
  ...props
}: PageHeaderProps) {
  return (
    <DesignSystemPageHeader
      {...props}
      primaryAction={
        primaryAction
          ? { label: primaryAction.label }
          : undefined
      }
      secondaryActions={secondaryActions?.map((action) => ({
        label: action.label,
      }))}
    />
  );
}
