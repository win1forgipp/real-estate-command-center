import {
  Contact,
  FileText,
  FolderOpen,
  Home,
  MapPin,
  Users,
} from "lucide-react";

import type { CommandPaletteItem } from "@/lib/command-palette/types";
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
  const items: CommandPaletteItem[] = [];

  for (const config of pageConfigs) {
    items.push({
      id: `action-${config.pathname}-primary`,
      label: config.primaryAction.label,
      description: `${config.title} · Primary action`,
      keywords: [
        config.primaryAction.label,
        config.title,
        "create",
        "add",
        "new",
      ],
      group: "actions",
      href: config.pathname,
    });

    for (const action of config.secondaryActions ?? []) {
      items.push({
        id: `action-${config.pathname}-${action.label}`,
        label: action.label,
        description: `${config.title} · Secondary action`,
        keywords: [action.label, config.title, "action"],
        group: "actions",
        href: config.pathname,
      });
    }
  }

  items.push({
    id: "action-schedule-showing",
    label: "Schedule Showing",
    description: "Showings · Primary action",
    keywords: ["showing", "schedule", "appointment"],
    group: "actions",
    icon: MapPin,
    href: "/showings",
  });

  items.push({
    id: "action-add-buyer",
    label: "Add Buyer",
    description: "Buyers · Primary action",
    keywords: ["buyer", "client", "add"],
    group: "actions",
    icon: Users,
    href: "/buyers",
  });

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
