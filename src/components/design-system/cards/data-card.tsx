import { typography } from "@/lib/design-system/typography";
import { cn } from "@/lib/utils";

type DataCardRow = {
  label: string;
  value: React.ReactNode;
};

type DataCardProps = {
  title: string;
  rows: DataCardRow[];
  footer?: React.ReactNode;
  className?: string;
};

export function DataCard({ title, rows, footer, className }: DataCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-5 shadow-sm",
        className,
      )}
    >
      <h3 className={typography.cardTitle}>{title}</h3>
      <dl className="mt-4 space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 last:border-b-0 last:pb-0"
          >
            <dt className={typography.caption}>{row.label}</dt>
            <dd className={cn(typography.label, "text-right")}>{row.value}</dd>
          </div>
        ))}
      </dl>
      {footer ? <div className="mt-4 border-t border-border/60 pt-4">{footer}</div> : null}
    </section>
  );
}
