import type { LucideIcon } from "lucide-react";

import type { AppActionId } from "@/lib/app-actions";

export type CommandPaletteGroupId =
  | "navigation"
  | "actions"
  | "workspaces"
  | "recent";

export type CommandPaletteGroup = {
  id: CommandPaletteGroupId;
  label: string;
};

export type CommandPaletteItem = {
  id: string;
  label: string;
  description?: string;
  keywords?: string[];
  group: CommandPaletteGroupId;
  icon?: LucideIcon;
  href?: string;
  actionId?: AppActionId;
  disabled?: boolean;
};

export const commandPaletteGroups: CommandPaletteGroup[] = [
  { id: "recent", label: "Recent" },
  { id: "navigation", label: "Navigation" },
  { id: "actions", label: "Quick Actions" },
  { id: "workspaces", label: "Workspaces" },
];
