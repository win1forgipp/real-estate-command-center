"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import {
  PageHeader as DesignSystemPageHeader,
} from "@/components/design-system/layout/page-header";
import { getActionClickHandler } from "@/lib/create-actions";
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
  const router = useRouter();
  const navigate = useCallback((href: string) => router.push(href), [router]);

  return (
    <DesignSystemPageHeader
      {...props}
      primaryAction={
        primaryAction
          ? {
              label: primaryAction.label,
              onClick: getActionClickHandler(
                primaryAction.label,
                navigate,
                primaryAction.onClick,
              ),
            }
          : undefined
      }
      secondaryActions={secondaryActions?.map((action) => ({
        label: action.label,
        onClick: getActionClickHandler(action.label, navigate, action.onClick),
      }))}
    />
  );
}
