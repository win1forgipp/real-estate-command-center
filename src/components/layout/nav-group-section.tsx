"use client";

import { ChevronDown } from "lucide-react";

import { NavLink } from "@/components/layout/nav-link";
import type { NavGroup } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type NavGroupSectionProps = {
  group: NavGroup;
  expanded: boolean;
  onToggle: (groupId: string) => void;
  onNavigate?: () => void;
};

export function NavGroupSection({
  group,
  expanded,
  onToggle,
  onNavigate,
}: NavGroupSectionProps) {
  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => onToggle(group.id)}
        className="flex min-h-11 w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        aria-expanded={expanded}
      >
        <span>{group.label}</span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded ? (
        <div className="space-y-1 pb-1 pl-2">
          {group.items.map((item) => (
            <NavLink key={item.href} item={item} onNavigate={onNavigate} nested />
          ))}
        </div>
      ) : null}
    </div>
  );
}
