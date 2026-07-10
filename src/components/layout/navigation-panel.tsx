"use client";

import { NavGroupSection } from "@/components/layout/nav-group-section";
import { NavLink } from "@/components/layout/nav-link";
import { useNavGroupsState } from "@/hooks/use-nav-groups-state";
import { navigationEntries } from "@/lib/navigation";
import { NAV_ITEM_PERMISSIONS } from "@/lib/permissions/route-permissions";
import { usePermissions } from "@/lib/permissions/use-permissions";
import { cn } from "@/lib/utils";

type NavigationPanelProps = {
  onNavigate?: () => void;
  className?: string;
};

export function NavigationPanel({
  onNavigate,
  className,
}: NavigationPanelProps) {
  const { isExpanded, toggleGroup, hydrated } = useNavGroupsState();
  const { can } = usePermissions();

  const visibleEntries = navigationEntries
    .map((entry) => {
      if (entry.type === "link") {
        const permission = NAV_ITEM_PERMISSIONS[entry.href];
        return permission && !can(permission) ? null : entry;
      }

      const items = entry.items.filter((item) => {
        const permission = NAV_ITEM_PERMISSIONS[item.href];
        return !permission || can(permission);
      });

      if (!items.length) {
        return null;
      }

      return { ...entry, items };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry != null);

  return (
    <nav className={cn("space-y-2", className)}>
      {visibleEntries.map((entry) =>
        entry.type === "link" ? (
          <NavLink key={entry.href} item={entry} onNavigate={onNavigate} />
        ) : (
          <NavGroupSection
            key={entry.id}
            group={entry}
            expanded={hydrated ? isExpanded(entry.id) : false}
            onToggle={toggleGroup}
            onNavigate={onNavigate}
          />
        ),
      )}
    </nav>
  );
}
