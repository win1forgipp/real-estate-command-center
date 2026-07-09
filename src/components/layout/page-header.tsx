"use client";

import {
  PageHeader as DesignSystemPageHeader,
} from "@/components/design-system/layout/page-header";
import { getActionLabel } from "@/lib/app-actions";
import { useAppAction } from "@/lib/app-actions/use-app-action";
import type { PageAction } from "@/lib/page-config";

type PageHeaderProps = {
  title: string;
  subtitle: string;
  primaryAction?: PageAction;
  secondaryActions?: PageAction[];
  className?: string;
};

function resolveHeaderAction(
  action: PageAction,
  getActionProps: ReturnType<typeof useAppAction>["getActionProps"],
) {
  const props = getActionProps(action.actionId);

  return {
    label: getActionLabel(action.actionId),
    onClick: props.onClick,
    disabled: props.disabled,
  };
}

export function PageHeader({
  primaryAction,
  secondaryActions,
  ...props
}: PageHeaderProps) {
  const { getActionProps } = useAppAction();

  return (
    <DesignSystemPageHeader
      {...props}
      primaryAction={
        primaryAction
          ? resolveHeaderAction(primaryAction, getActionProps)
          : undefined
      }
      secondaryActions={secondaryActions?.map((action) =>
        resolveHeaderAction(action, getActionProps),
      )}
    />
  );
}
