import { SidebarBrand } from "@/components/layout/sidebar-brand";
import { NavigationPanel } from "@/components/layout/navigation-panel";
import { cn } from "@/lib/utils";

type SidebarProps = {
  collapsed?: boolean;
  className?: string;
};

export function Sidebar({ collapsed = false, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-border/70 bg-card transition-[width] duration-200",
        collapsed
          ? "w-0 overflow-hidden md:w-0 lg:w-72 lg:overflow-visible"
          : "w-72",
        className,
      )}
    >
      <SidebarBrand />
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavigationPanel />
      </div>
    </aside>
  );
}
