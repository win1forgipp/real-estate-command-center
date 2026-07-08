"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavLinkConfig } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type NavLinkProps = {
  item: NavLinkConfig;
  onNavigate?: () => void;
  nested?: boolean;
  compact?: boolean;
};

export function NavLink({
  item,
  onNavigate,
  nested = false,
  compact = false,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={compact ? item.label : undefined}
      className={cn(
        "flex min-h-11 items-center rounded-xl text-sm font-medium transition-colors",
        compact ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
        nested && !compact && "pl-5",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      {!compact ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );
}
