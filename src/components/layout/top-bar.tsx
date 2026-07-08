"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getPageTitle } from "@/lib/navigation";
import { currentUser } from "@/lib/mock-data";

type TopBarProps = {
  onMenuClick: () => void;
};

export function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b border-border/70 bg-card/95 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="lg:hidden"
          aria-label="Open menu"
          onClick={onMenuClick}
        >
          <Menu className="size-5" />
        </Button>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Business Dashboard
          </p>
          <h1 className="truncate text-lg font-semibold text-foreground md:text-xl">
            {pageTitle}
          </h1>
        </div>
      </div>

      <div className="hidden shrink-0 rounded-xl border border-border/70 bg-muted/40 px-4 py-2 text-right sm:block">
        <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
        <p className="text-xs text-muted-foreground">{currentUser.role}</p>
      </div>
    </header>
  );
}
