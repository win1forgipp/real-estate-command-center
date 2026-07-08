"use client";

import { Button } from "@/components/ui/button";
import type { PageAction } from "@/lib/page-config";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle: string;
  primaryAction?: PageAction;
  secondaryActions?: PageAction[];
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  primaryAction,
  secondaryActions = [],
  className,
}: PageHeaderProps) {
  const actions = [
    ...secondaryActions.map((action) => ({ ...action, priority: "secondary" as const })),
    ...(primaryAction ? [{ ...primaryAction, priority: "primary" as const }] : []),
  ].reverse();

  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm md:flex-row md:items-start md:justify-between md:p-6",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="mt-2 max-w-3xl text-base leading-7 text-muted-foreground">
          {subtitle}
        </p>
      </div>

      {actions.length ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          {actions.map((action) => (
            <Button
              key={action.label}
              type="button"
              size="lg"
              variant={
                action.priority === "primary"
                  ? "default"
                  : action.variant ?? "outline"
              }
              className="min-h-11 w-full sm:w-auto"
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
