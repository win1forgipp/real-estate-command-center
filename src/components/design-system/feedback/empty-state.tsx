"use client";

import type { LucideIcon } from "lucide-react";

import { PrimaryButton } from "@/components/design-system/buttons/action-buttons";
import { typography } from "@/lib/design-system/typography";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
  helpText?: string;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  helpText,
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "mx-auto flex max-w-2xl flex-col items-center rounded-2xl border border-dashed border-border/80 bg-card px-6 py-12 text-center shadow-sm md:px-10",
        className,
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-foreground">
        <Icon className="size-8" aria-hidden="true" />
      </div>
      <h3 className={cn(typography.sectionTitle, "mt-6")}>{title}</h3>
      <p className={cn(typography.bodyMuted, "mt-3 max-w-xl")}>{description}</p>
      <PrimaryButton type="button" className="mt-6 min-w-44" onClick={onAction}>
        {actionLabel}
      </PrimaryButton>
      {helpText ? (
        <p className={cn(typography.caption, "mt-4 max-w-lg")}>{helpText}</p>
      ) : null}
    </section>
  );
}
