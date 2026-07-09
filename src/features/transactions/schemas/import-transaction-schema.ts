import { z } from "zod";

export const importReviewSchema = z.object({
  propertyAddress: z.string().min(1, "Property address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2).max(2),
  zip: z.string().min(5, "ZIP is required"),
  purchasePrice: z.number().nonnegative().optional(),
  contractDate: z.string().optional(),
  closingDate: z.string().optional(),
  transactionType: z.enum(["buyer", "seller", "dual"]),
  transactionStatus: z
    .enum([
      "prospect",
      "under_contract",
      "inspection",
      "appraisal",
      "financing",
      "closing",
      "closed",
      "cancelled",
      "archived",
    ])
    .optional(),
  mlsNumber: z.string().optional(),
  specialTerms: z.string().optional(),
  buyerNames: z.string().optional(),
  sellerNames: z.string().optional(),
  listingAgent: z.string().optional(),
  sellingAgent: z.string().optional(),
  listingBrokerage: z.string().optional(),
  sellingBrokerage: z.string().optional(),
  earnestMoneyAmount: z.number().nonnegative().optional(),
  earnestMoneyHeldBy: z
    .enum(["sellers_brokerage", "buyers_brokerage", "other"])
    .optional(),
  earnestMoneyHolderName: z.string().optional(),
  sellerConcessions: z.number().nonnegative().optional(),
  commission: z.number().nonnegative().optional(),
  inspectionDeadline: z.string().optional(),
  financingDeadline: z.string().optional(),
  appraisalDeadline: z.string().optional(),
  earnestMoneyDueDate: z.string().optional(),
  contingencyDeadline: z.string().optional(),
  walkthroughDate: z.string().optional(),
  closingDeadline: z.string().optional(),
  lender: z.string().optional(),
  titleCompany: z.string().optional(),
  closingCompany: z.string().optional(),
  attorney: z.string().optional(),
  inspector: z.string().optional(),
  assignedUserId: z.string().min(1, "Assigned agent is required"),
  importConfidence: z.number().min(0).max(100).optional(),
  archiveReason: z.string().optional(),
});

export type ImportReviewInput = z.infer<typeof importReviewSchema>;

import type { ItiExtractionResult } from "@/services/iti/types";

export function extractionToReviewDefaults(
  extraction: ItiExtractionResult,
  assignedUserId: string,
): ImportReviewInput {
  return {
    propertyAddress: extraction.transaction.propertyAddress.value ?? "",
    city: extraction.transaction.city.value ?? "",
    state: extraction.transaction.state.value ?? "",
    zip: extraction.transaction.zip.value ?? "",
    purchasePrice: extraction.transaction.purchasePrice.value ?? undefined,
    contractDate: extraction.transaction.contractDate.value ?? undefined,
    closingDate: extraction.transaction.closingDate.value ?? undefined,
    transactionType: extraction.transaction.transactionType.value ?? "buyer",
    transactionStatus:
      (extraction.transaction.transactionStatus.value as ImportReviewInput["transactionStatus"]) ??
      undefined,
    mlsNumber: extraction.transaction.mlsNumber.value ?? undefined,
    specialTerms: extraction.transaction.specialTerms.value ?? undefined,
    buyerNames: extraction.parties.buyerNames.value ?? undefined,
    sellerNames: extraction.parties.sellerNames.value ?? undefined,
    listingAgent: extraction.parties.listingAgent.value ?? undefined,
    sellingAgent: extraction.parties.sellingAgent.value ?? undefined,
    listingBrokerage: extraction.parties.listingBrokerage.value ?? undefined,
    sellingBrokerage: extraction.parties.sellingBrokerage.value ?? undefined,
    earnestMoneyAmount: extraction.money.earnestMoneyAmount.value ?? undefined,
    earnestMoneyHeldBy: extraction.money.earnestMoneyHeldBy.value ?? undefined,
    earnestMoneyHolderName: extraction.money.earnestMoneyHolderName.value ?? undefined,
    sellerConcessions: extraction.money.sellerConcessions.value ?? undefined,
    commission: extraction.money.commission.value ?? undefined,
    inspectionDeadline: extraction.deadlines.inspectionDeadline.value ?? undefined,
    financingDeadline: extraction.deadlines.financingDeadline.value ?? undefined,
    appraisalDeadline: extraction.deadlines.appraisalDeadline.value ?? undefined,
    earnestMoneyDueDate: extraction.deadlines.earnestMoneyDueDate.value ?? undefined,
    contingencyDeadline: extraction.deadlines.contingencyDeadline.value ?? undefined,
    walkthroughDate: extraction.deadlines.walkthroughDate.value ?? undefined,
    closingDeadline: extraction.deadlines.closingDate.value ?? undefined,
    lender: extraction.serviceProviders.lender.value ?? undefined,
    titleCompany: extraction.serviceProviders.titleCompany.value ?? undefined,
    closingCompany: extraction.serviceProviders.closingCompany.value ?? undefined,
    attorney: extraction.serviceProviders.attorney.value ?? undefined,
    inspector: extraction.serviceProviders.inspector.value ?? undefined,
    assignedUserId,
    importConfidence: extraction.overallConfidence,
    archiveReason: extraction.archiveCandidate.reasons.join(" "),
  };
}
