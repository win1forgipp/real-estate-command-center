export type PreviewRole =
  | "administrator"
  | "partner"
  | "accountant"
  | "transaction_coordinator"
  | "read_only";

export const PREVIEW_ROLES: PreviewRole[] = [
  "administrator",
  "partner",
  "accountant",
  "transaction_coordinator",
  "read_only",
];

export const PREVIEW_ROLE_LABELS: Record<PreviewRole, string> = {
  administrator: "Administrator",
  partner: "Partner",
  accountant: "Accountant",
  transaction_coordinator: "Transaction Coordinator",
  read_only: "Read Only",
};

export const DEFAULT_PREVIEW_ROLE: PreviewRole = "administrator";

export const VIEW_AS_STORAGE_KEY = "rec-preview-role";

export function isPreviewRole(value: string | null | undefined): value is PreviewRole {
  return PREVIEW_ROLES.includes(value as PreviewRole);
}
