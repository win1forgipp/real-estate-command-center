import type { ItiDocumentType } from "@/services/iti/types";

export function detectItiDocumentType(fileName: string): ItiDocumentType {
  const lower = fileName.toLowerCase();

  if (lower.includes("purchase") || lower.includes("contract") || lower.includes("psa")) {
    return "purchase_agreement";
  }
  if (lower.includes("repair") && lower.includes("addendum")) {
    return "repair_addendum";
  }
  if (lower.includes("addendum")) {
    return "addendum";
  }
  if (lower.includes("amendment")) {
    return "amendment";
  }
  if (lower.includes("contingency") || lower.includes("removal")) {
    return "contingency_removal";
  }
  if (lower.includes("inspection")) {
    return "inspection_response";
  }
  if (
    lower.includes("closing") ||
    lower.includes("settlement") ||
    lower.includes("disclosure")
  ) {
    return "closing_document";
  }
  return "other";
}
