import type { Permission } from "@/lib/permissions/permissions";

export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/": "view_dashboard",
  "/transactions": "view_transactions",
  "/buyers": "view_buyers",
  "/sellers": "view_sellers",
  "/contacts": "view_contacts",
  "/showings": "view_showings",
  "/deadlines": "view_deadlines",
  "/tasks": "view_tasks",
  "/documents": "view_documents",
  "/templates": "view_templates",
  "/commissions": "view_commissions",
  "/expenses": "view_expenses",
  "/settings": "manage_settings",
};

export function getRoutePermission(pathname: string): Permission | null {
  if (pathname === "/") {
    return "view_dashboard";
  }

  const entries = Object.entries(ROUTE_PERMISSIONS).sort(
    (left, right) => right[0].length - left[0].length,
  );

  for (const [route, permission] of entries) {
    if (route === "/") {
      continue;
    }

    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return permission;
    }
  }

  return null;
}

export const DASHBOARD_CARD_PERMISSIONS: Record<string, Permission> = {
  "active-transactions": "view_transactions",
  "deadlines-this-week": "view_deadlines",
  "tasks-due-today": "view_tasks",
  "closings-this-month": "view_transactions",
  "commission-pipeline": "view_commissions",
  "active-listings": "view_sellers",
  "buyer-leads": "view_buyers",
  "needs-attention": "view_dashboard",
};

export const NAV_ITEM_PERMISSIONS: Record<string, Permission> = {
  "/": "view_dashboard",
  "/transactions": "view_transactions",
  "/buyers": "view_buyers",
  "/sellers": "view_sellers",
  "/contacts": "view_contacts",
  "/showings": "view_showings",
  "/deadlines": "view_deadlines",
  "/tasks": "view_tasks",
  "/documents": "view_documents",
  "/templates": "view_templates",
  "/commissions": "view_commissions",
  "/expenses": "view_expenses",
  "/settings": "manage_settings",
};

export const WORKSPACE_TAB_PERMISSIONS: Record<string, Permission> = {
  overview: "view_transactions",
  tasks: "view_tasks",
  deadlines: "view_deadlines",
  contacts: "view_contacts",
  documents: "view_documents",
  notes: "view_transactions",
  timeline: "view_transactions",
  commission: "view_commissions",
  "ai-assistant": "view_transactions",
};
