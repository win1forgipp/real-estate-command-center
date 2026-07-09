import {
  Contact,
  FileText,
  FolderOpen,
  Home,
  MapPin,
  Users,
} from "lucide-react";

import type { CommandPaletteItem } from "@/lib/command-palette/types";
import { getPaletteActions } from "@/lib/app-actions";
import { mockSearchResults } from "@/lib/mock-data";
import { getAllNavLinks } from "@/lib/navigation";
import { pageConfigs } from "@/lib/page-config";

const workspaceCategoryConfig = {
  transactions: {
    icon: FileText,
    href: "/transactions",
    workspaceLabel: "Transaction Workspace",
  },
  contacts: {
    icon: Contact,
    href: "/contacts",
    workspaceLabel: "Contact Workspace",
  },
  properties: {
    icon: Home,
    href: "/sellers",
    workspaceLabel: "Property Workspace",
  },
  documents: {
    icon: FolderOpen,
    href: "/documents",
    workspaceLabel: "Document Workspace",
  },
  templates: {
    icon: FileText,
    href: "/templates",
    workspaceLabel: "Template Workspace",
  },
} as const;

const paletteActionIcons: Partial<Record<string, typeof FileText>> = {
  new_transaction: FileText,
  add_buyer: Users,
  add_showing: MapPin,
};

function buildNavigationItems(): CommandPaletteItem[] {
  return getAllNavLinks().map((link) => ({
    id: `nav-${link.href}`,
    label: link.label,
    description: `Go to ${link.label}`,
    keywords: [link.label, "navigate", "open", "module"],
    group: "navigation",
    icon: link.icon,
    href: link.href,
  }));
}

function buildActionItems(): CommandPaletteItem[] {
  const paletteActions = getPaletteActions();
  const items: CommandPaletteItem[] = paletteActions.map((action) => ({
    id: `action-${action.id}`,
    label: action.label,
    description: `Quick action · ${action.label}`,
    keywords: [
      action.label,
      ...(action.paletteKeywords ?? []),
      ...(action.aliases ?? []),
      "create",
      "add",
      "new",
      "action",
    ],
    group: "actions",
    actionId: action.id,
    icon: paletteActionIcons[action.id],
  }));

  for (const config of pageConfigs) {
    for (const action of config.secondaryActions ?? []) {
      const alreadyIncluded = items.some((item) => item.actionId === action.actionId);
      if (alreadyIncluded) {
        continue;
      }

      const definition = paletteActions.find((entry) => entry.id === action.actionId);
      if (!definition) {
        continue;
      }

      items.push({
        id: `action-${config.pathname}-${action.actionId}`,
        label: definition.label,
        description: `${config.title} · Secondary action`,
        keywords: [definition.label, config.title, "action"],
        group: "actions",
        actionId: action.actionId,
      });
    }
  }

  return items;
}

function buildWorkspaceItems(): CommandPaletteItem[] {
  return mockSearchResults.map((result) => {
    const config = workspaceCategoryConfig[result.category];

    return {
      id: `workspace-${result.id}`,
      label: result.label,
      description: `${config.workspaceLabel} · ${result.detail}`,
      keywords: [
        result.label,
        result.detail,
        result.category,
        config.workspaceLabel,
        "workspace",
        "record",
        "open",
      ],
      group: "workspaces",
      icon: config.icon,
      href: config.href,
    };
  });
}

export function getCommandPaletteItems(): CommandPaletteItem[] {
  return [
    ...buildNavigationItems(),
    ...buildActionItems(),
    ...buildWorkspaceItems(),
  ];
}

export function getCommandPaletteItemMap() {
  return new Map(
    getCommandPaletteItems().map((item) => [item.id, item] as const),
  );
}

export function getRecentCommandItems(recentIds: string[]): CommandPaletteItem[] {
  const itemMap = getCommandPaletteItemMap();

  return recentIds
    .map((id) => itemMap.get(id))
    .filter((item): item is CommandPaletteItem => Boolean(item));
}
