"use client";

import {
  ChevronDown,
  CircleHelp,
  Eye,
  LogOut,
  Settings2,
  UserRound,
} from "lucide-react";
import { useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppAction } from "@/lib/app-actions/use-app-action";
import { currentUser } from "@/lib/mock-data";
import {
  PREVIEW_ROLE_LABELS,
  PREVIEW_ROLES,
  type PreviewRole,
} from "@/lib/permissions/roles";
import { usePermissions } from "@/lib/permissions/use-permissions";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { run } = useAppAction();
  const { previewRole, previewRoleLabel, setPreviewRole, resetPreviewRole } =
    usePermissions();
  const [open, setOpen] = useState(false);

  const handleSelect = (callback: () => void) => {
    callback();
    setOpen(false);
  };

  const handlePreviewRole = (role: PreviewRole) => {
    if (role === "administrator") {
      resetPreviewRole();
    } else {
      setPreviewRole(role);
    }
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        type="button"
        aria-label="Open user menu"
        className={cn(buttonVariants({ variant: "outline" }), "min-h-11 gap-2 px-3")}
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {currentUser.initials}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium text-foreground">
            {currentUser.name}
          </span>
          <span className="block text-xs text-muted-foreground">
            {previewRoleLabel}
          </span>
        </span>
        <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div>
            <p className="text-sm font-medium text-foreground">
              {currentUser.name}
            </p>
            <p className="text-xs text-muted-foreground">{previewRoleLabel}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => handleSelect(() => run("open_profile"))}>
          <UserRound className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleSelect(() => run("open_settings"))}>
          <Settings2 className="size-4" />
          Preferences
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Eye className="size-4" />
            View As
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56">
            {PREVIEW_ROLES.map((role) => (
              <DropdownMenuItem
                key={role}
                onSelect={() => handlePreviewRole(role)}
                className={cn(previewRole === role && "bg-muted")}
              >
                {PREVIEW_ROLE_LABELS[role]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onSelect={() => handleSelect(() => run("open_help"))}>
          <CircleHelp className="size-4" />
          Help
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => handleSelect(() => run("sign_out"))}
        >
          <LogOut className="size-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
