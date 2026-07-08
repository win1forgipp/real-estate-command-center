"use client";

import Link from "next/link";
import { ArrowRight, Minus, TrendingDown, TrendingUp } from "lucide-react";

import { StatusBadge } from "@/components/dashboard/status-badge";
import {
  dashboardCardIcons,
  type DashboardCardData,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type DashboardCardProps = {
  data: DashboardCardData;
  className?: string;
};

function TrendIndicator({
  trend,
}: {
  trend: NonNullable<DashboardCardData["trend"]>;
}) {
  const Icon =
    trend.direction === "up"
      ? TrendingUp
      : trend.direction === "down"
        ? TrendingDown
        : Minus;

  return (
    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
      <Icon className="size-3.5" aria-hidden="true" />
      <span>{trend.label}</span>
    </div>
  );
}

function DashboardCardContent({ data }: { data: DashboardCardData }) {
  const Icon = dashboardCardIcons[data.icon];

  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {data.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.description}
            </p>
          </div>
        </div>
        {data.statusLabel ? (
          <StatusBadge label={data.statusLabel} variant={data.status} />
        ) : null}
      </div>

      <div className="mb-4 flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold tracking-tight text-foreground">
          {data.value}
        </p>
        {data.trend ? <TrendIndicator trend={data.trend} /> : null}
      </div>

      {data.items?.length ? (
        <ul className="mt-auto space-y-3 border-t border-border/60 pt-4">
          {data.items.map((item) => (
            <li
              key={`${data.id}-${item.label}`}
              className="flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.label}
                </p>
                {item.detail ? (
                  <p className="truncate text-sm text-muted-foreground">
                    {item.detail}
                  </p>
                ) : null}
              </div>
              {item.statusLabel ? (
                <StatusBadge
                  label={item.statusLabel}
                  variant={item.status}
                  className="shrink-0"
                />
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {data.href ? (
        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
          View details
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>
      ) : null}
    </>
  );
}

export function DashboardCard({ data, className }: DashboardCardProps) {
  const cardClassName = cn(
    "group flex h-full flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-colors",
    data.href &&
      "hover:border-primary/30 hover:bg-card/95 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
    className,
  );

  if (data.href) {
    return (
      <Link href={data.href} className={cardClassName}>
        <DashboardCardContent data={data} />
      </Link>
    );
  }

  return (
    <section className={cardClassName}>
      <DashboardCardContent data={data} />
    </section>
  );
}
