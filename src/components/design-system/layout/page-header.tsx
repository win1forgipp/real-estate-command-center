"use client";

import { PrimaryButton, SecondaryButton } from "@/components/design-system/buttons/action-buttons";
import { typography } from "@/lib/design-system/typography";
import { cn } from "@/lib/utils";

export type HeaderAction = {
  label: string;
  onClick?: () => void;
};

type PageHeaderProps = {
  title: string;
  subtitle: string;
  primaryAction?: HeaderAction;
  secondaryActions?: HeaderAction[];
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  primaryAction,
  secondaryActions = [],
  className,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm md:flex-row md:items-start md:justify-between md:p-6",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className={typography.pageTitle}>{title}</h2>
        <p className={cn(typography.bodyMuted, "mt-2 max-w-3xl")}>{subtitle}</p>
      </div>

      {primaryAction || secondaryActions.length ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          {secondaryActions.map((action) => (
            <SecondaryButton
              key={action.label}
              type="button"
              className="w-full sm:w-auto"
              onClick={action.onClick}
            >
              {action.label}
            </SecondaryButton>
          ))}
          {primaryAction ? (
            <PrimaryButton
              type="button"
              className="w-full sm:w-auto"
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </PrimaryButton>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
