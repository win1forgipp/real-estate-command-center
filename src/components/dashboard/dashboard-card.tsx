import { StatusBadge } from "@/components/dashboard/status-badge";
import type { DashboardCardData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type DashboardCardProps = {
  data: DashboardCardData;
  className?: string;
};

export function DashboardCard({ data, className }: DashboardCardProps) {
  return (
    <section
      className={cn(
        "flex h-full flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {data.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{data.subtitle}</p>
        </div>
        {data.statusLabel ? (
          <StatusBadge label={data.statusLabel} variant={data.status} />
        ) : null}
      </div>

      <p className="mb-4 text-3xl font-semibold tracking-tight text-foreground">
        {data.value}
      </p>

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
    </section>
  );
}
