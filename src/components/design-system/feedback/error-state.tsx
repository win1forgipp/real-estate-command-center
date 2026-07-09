"use client";

import { AlertCircle } from "lucide-react";

import { SecondaryButton } from "@/components/design-system/buttons/action-buttons";
import { typography } from "@/lib/design-system/typography";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this section. Try again in a moment.",
  retryLabel = "Try again",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center rounded-2xl border border-destructive/30 bg-card px-6 py-12 text-center shadow-sm",
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertCircle className="size-7" aria-hidden="true" />
      </div>
      <h3 className={cn(typography.sectionTitle, "mt-4")}>{title}</h3>
      <p className={cn(typography.bodyMuted, "mt-2 max-w-md")}>{description}</p>
      {onRetry ? (
        <SecondaryButton type="button" className="mt-6" onClick={onRetry}>
          {retryLabel}
        </SecondaryButton>
      ) : null}
    </section>
  );
}
