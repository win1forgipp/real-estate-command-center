import { NavLink } from "@/components/layout/nav-link";
import { navigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex w-72 shrink-0 flex-col border-r border-border/70 bg-card",
        className,
      )}
    >
      <div className="border-b border-border/70 px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Real Estate
        </p>
        <h1 className="mt-1 text-lg font-semibold text-foreground">
          Command Center
        </h1>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigationItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
    </aside>
  );
}
