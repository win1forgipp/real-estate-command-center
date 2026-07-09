"use client";

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { usePathname } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CommandPaletteTrigger } from "@/components/command-palette";
import { NotificationBell } from "@/components/layout/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { getBreadcrumbs } from "@/lib/navigation";

type TopBarProps = {
  onMenuClick: () => void;
  onSidebarToggle: () => void;
  sidebarCollapsed: boolean;
};

export function TopBar({
  onMenuClick,
  onSidebarToggle,
  sidebarCollapsed,
}: TopBarProps) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-card/95 backdrop-blur">
      <div className="flex min-h-16 items-center gap-3 px-4 md:px-6">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="md:hidden"
          aria-label="Open menu"
          onClick={onMenuClick}
        >
          <Menu className="size-5" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="hidden md:inline-flex lg:hidden"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={onSidebarToggle}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="size-5" />
          ) : (
            <PanelLeftClose className="size-5" />
          )}
        </Button>

        <div className="min-w-0 flex-1">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        <div className="hidden flex-1 justify-center xl:flex">
          <CommandPaletteTrigger />
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <UserMenu />
        </div>
      </div>

      <div className="border-t border-border/60 px-4 pb-3 md:px-6 xl:hidden">
        <CommandPaletteTrigger />
      </div>
    </header>
  );
}
