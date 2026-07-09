import { spacing } from "@/lib/design-system/spacing";
import { cn } from "@/lib/utils";

type FilterBarProps = {
  search?: React.ReactNode;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function FilterBar({
  search,
  filters,
  actions,
  className,
}: FilterBarProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-4 shadow-sm",
        spacing.inlineMd,
        "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
        {search ? <div className="w-full md:max-w-md">{search}</div> : null}
        {filters ? (
          <div className="flex flex-wrap items-center gap-2">{filters}</div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </section>
  );
}
