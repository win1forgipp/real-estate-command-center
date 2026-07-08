"use client";

import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PageAction } from "@/lib/page-config";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction: PageAction;
  helpText: string;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
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
      <h3 className="mt-6 text-2xl font-semibold text-foreground">{title}</h3>
      <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
        {description}
      </p>
      <Button type="button" size="lg" className="mt-6 min-h-11 min-w-44">
        {primaryAction.label}
      </Button>
      <p className="mt-4 max-w-lg text-sm text-muted-foreground">{helpText}</p>
    </section>
  );
}
