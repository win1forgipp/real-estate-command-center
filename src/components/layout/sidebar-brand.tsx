import { cn } from "@/lib/utils";

type SidebarBrandProps = {
  compact?: boolean;
  className?: string;
};

export function SidebarBrand({ compact = false, className }: SidebarBrandProps) {
  return (
    <div
      className={cn(
        "border-b border-border/70 px-5 py-6",
        compact && "px-3 py-5 text-center",
        className,
      )}
    >
      {!compact ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Real Estate
          </p>
          <h1 className="mt-1 text-lg font-semibold text-foreground">
            Command Center
          </h1>
        </>
      ) : (
        <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
          RC
        </div>
      )}
    </div>
  );
}
