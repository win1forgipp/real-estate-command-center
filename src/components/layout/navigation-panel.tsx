"use client";

import { NavGroupSection } from "@/components/layout/nav-group-section";
import { NavLink } from "@/components/layout/nav-link";
import { useNavGroupsState } from "@/hooks/use-nav-groups-state";
import { navigationEntries } from "@/lib/navigation";
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

  return (
    <nav className={cn("space-y-2", className)}>
      {navigationEntries.map((entry) =>
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
