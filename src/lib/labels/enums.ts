import { formatEnumLabel } from "@/lib/formatting/enum-label";
import type { SelectOption } from "@/lib/formatting/option-label";

function optionsFromValues<T extends string>(
  values: readonly T[],
  labels?: Partial<Record<T, string>>,
): SelectOption[] {
  return values.map((value) => ({
    value,
    label: labels?.[value] ?? formatEnumLabel(value),
  }));
}

export const transactionTypeOptions = [
  { label: "Buyer Representation", value: "buyer" },
  { label: "Seller Listing", value: "seller" },
  { label: "Dual Agency", value: "dual" },
] as const;

export const transactionStatusOptions = optionsFromValues(
  [
    "prospect",
    "under_contract",
    "inspection",
    "appraisal",
    "financing",
    "closing",
    "closed",
    "cancelled",
    "archived",
  ] as const,
  {
    prospect: "Prospect",
    under_contract: "Under Contract",
    inspection: "Inspection",
    appraisal: "Appraisal",
    financing: "Financing",
    closing: "Closing",
    closed: "Closed",
    cancelled: "Cancelled",
    archived: "Archived",
  },
);

export const earnestMoneyHeldByOptions = [
  { label: "Seller's Brokerage", value: "sellers_brokerage" },
  { label: "Buyer's Brokerage", value: "buyers_brokerage" },
  { label: "Other", value: "other" },
] as const;

export const contactTypeOptions = optionsFromValues(
  [
    "buyer",
    "seller",
    "agent",
    "lender",
    "attorney",
    "inspector",
    "contractor",
    "vendor",
    "title_company",
    "other",
  ] as const,
  {
    title_company: "Title Company",
  },
);

export const listingStatusOptions = optionsFromValues(
  ["coming_soon", "active", "under_contract", "sold", "withdrawn"] as const,
  {
    coming_soon: "Coming Soon",
    under_contract: "Under Contract",
  },
);

export const deadlineTypeOptions = optionsFromValues(
  [
    "inspection",
    "financing",
    "appraisal",
    "closing",
    "earnest_money",
    "contingency",
    "walkthrough",
    "custom",
  ] as const,
  {
    earnest_money: "Earnest Money",
  },
);

export const taskPriorityOptions = optionsFromValues(
  ["low", "medium", "high", "urgent"] as const,
);

export const linkTypeOptions = optionsFromValues(
  ["google_drive", "dropbox", "url", "document", "other"] as const,
  {
    google_drive: "Google Drive",
    dropbox: "Dropbox",
    url: "URL",
  },
);

export function getTransactionTypeLabel(value: string | null | undefined) {
  return (
    transactionTypeOptions.find((option) => option.value === value)?.label ??
    formatEnumLabel(value ?? "")
  );
}

export function getTransactionStatusLabel(value: string | null | undefined) {
  return (
    transactionStatusOptions.find((option) => option.value === value)?.label ??
    formatEnumLabel(value ?? "")
  );
}

export function getContactTypeLabel(value: string | null | undefined) {
  return (
    contactTypeOptions.find((option) => option.value === value)?.label ??
    formatEnumLabel(value ?? "")
  );
}

export function getEarnestMoneyHeldByLabel(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return (
    earnestMoneyHeldByOptions.find((option) => option.value === value)?.label ??
    formatEnumLabel(value)
  );
}
