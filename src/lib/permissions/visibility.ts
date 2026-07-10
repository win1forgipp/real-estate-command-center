import type { Permission } from "@/lib/permissions/permissions";
import type { PreviewRole } from "@/lib/permissions/roles";

const fullAccess = new Set<Permission>([
  "view_dashboard",
  "view_transactions",
  "edit_transactions",
  "view_contacts",
  "edit_contacts",
  "view_documents",
  "upload_documents",
  "view_commissions",
  "edit_commissions",
  "view_expenses",
  "edit_expenses",
  "view_mileage",
  "view_reports",
  "manage_users",
  "manage_settings",
  "view_buyers",
  "view_sellers",
  "view_showings",
  "view_templates",
  "view_tasks",
  "edit_tasks",
  "view_deadlines",
  "edit_deadlines",
  "view_iti_upload",
]);

const partnerAccess = new Set<Permission>([
  "view_dashboard",
  "view_transactions",
  "edit_transactions",
  "view_contacts",
  "edit_contacts",
  "view_documents",
  "upload_documents",
  "view_commissions",
  "edit_commissions",
  "view_expenses",
  "edit_expenses",
  "view_mileage",
  "view_reports",
  "view_buyers",
  "view_sellers",
  "view_showings",
  "view_templates",
  "view_tasks",
  "edit_tasks",
  "view_deadlines",
  "edit_deadlines",
  "view_iti_upload",
]);

const accountantAccess = new Set<Permission>([
  "view_dashboard",
  "view_transactions",
  "view_commissions",
  "edit_commissions",
  "view_expenses",
  "edit_expenses",
  "view_mileage",
  "view_reports",
]);

const transactionCoordinatorAccess = new Set<Permission>([
  "view_dashboard",
  "view_transactions",
  "edit_transactions",
  "view_contacts",
  "edit_contacts",
  "view_documents",
  "upload_documents",
  "view_tasks",
  "edit_tasks",
  "view_deadlines",
  "edit_deadlines",
]);

const readOnlyAccess = new Set<Permission>([
  "view_dashboard",
  "view_transactions",
  "view_contacts",
  "view_documents",
  "view_commissions",
  "view_expenses",
  "view_mileage",
  "view_reports",
  "view_buyers",
  "view_sellers",
  "view_showings",
  "view_templates",
  "view_tasks",
  "view_deadlines",
]);

export const ROLE_PERMISSIONS: Record<PreviewRole, ReadonlySet<Permission>> = {
  administrator: fullAccess,
  partner: partnerAccess,
  accountant: accountantAccess,
  transaction_coordinator: transactionCoordinatorAccess,
  read_only: readOnlyAccess,
};

export function getPermissionsForRole(role: PreviewRole): ReadonlySet<Permission> {
  return ROLE_PERMISSIONS[role];
}

export function roleHasPermission(role: PreviewRole, permission: Permission): boolean {
  return getPermissionsForRole(role).has(permission);
}

export function roleCanEdit(role: PreviewRole): boolean {
  return role !== "read_only";
}
