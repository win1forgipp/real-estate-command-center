import "server-only";

import { getDb } from "@/db/client";
import { contacts, deadlines, notes, transactions } from "@/db/schema";
import { acceptAiExtraction } from "@/services/ai-extractions/mutations";
import { confirmDocumentsForTransaction } from "@/services/documents/mutations";
import type { ImportReviewInput } from "@/features/transactions/schemas/import-transaction-schema";
import {
  calculateCommissionAmounts,
  percentToBps,
} from "@/lib/formatting/commission";

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] ?? "Unknown";
  const lastName = parts.slice(1).join(" ") || "Contact";
  return { firstName, lastName };
}

function parseNamesList(value: string | undefined) {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split(/,| and /i)
    .map((part) => part.trim())
    .filter(Boolean);
}

function getSideFlags(transactionType: ImportReviewInput["transactionType"]) {
  return {
    listingSide: transactionType === "seller" || transactionType === "dual",
    sellingSide: transactionType === "buyer" || transactionType === "dual",
  };
}

function resolveTransactionStatus(
  input: ImportReviewInput,
  importAsArchived: boolean,
) {
  if (importAsArchived) {
    return "archived" as const;
  }

  if (input.transactionStatus) {
    return input.transactionStatus;
  }

  return input.contractDate ? ("under_contract" as const) : ("prospect" as const);
}

function buildCommissionFields(review: ImportReviewInput) {
  const brokerageSplitBps = percentToBps(review.brokerageSplitPercentage ?? 30);

  if (review.commissionPercentage != null && review.purchasePrice != null) {
    const calculated = calculateCommissionAmounts({
      salePriceDollars: review.purchasePrice,
      commissionPercentageBps: percentToBps(review.commissionPercentage),
      brokerageSplitBps,
    });

    return {
      commissionPercentageBps: calculated.commissionPercentageBps,
      brokerageSplitBps: calculated.brokerageSplitBps,
      grossCommissionAmountCents: calculated.grossCommissionAmountCents,
      brokerageFeeAmountCents: calculated.brokerageFeeAmountCents,
      agentNetCommissionCents: calculated.agentNetCommissionCents,
      commissionExpected: calculated.grossCommissionDollars,
    };
  }

  if (review.commissionDollarAmount != null) {
    const grossCommissionAmountCents = review.commissionDollarAmount * 100;
    const brokerageFeeAmountCents = Math.round(
      (grossCommissionAmountCents * brokerageSplitBps) / 10_000,
    );

    return {
      commissionPercentageBps: null,
      brokerageSplitBps,
      grossCommissionAmountCents,
      brokerageFeeAmountCents,
      agentNetCommissionCents: grossCommissionAmountCents - brokerageFeeAmountCents,
      commissionExpected: review.commissionDollarAmount,
    };
  }

  return {
    commissionPercentageBps: null,
    brokerageSplitBps,
    grossCommissionAmountCents: null,
    brokerageFeeAmountCents: null,
    agentNetCommissionCents: null,
    commissionExpected: null,
  };
}

const deadlineFieldMap: Array<{
  field: keyof ImportReviewInput;
  type:
    | "inspection"
    | "financing"
    | "appraisal"
    | "earnest_money"
    | "contingency"
    | "walkthrough"
    | "closing";
}> = [
  { field: "inspectionDeadline", type: "inspection" },
  { field: "financingDeadline", type: "financing" },
  { field: "appraisalDeadline", type: "appraisal" },
  { field: "earnestMoneyDueDate", type: "earnest_money" },
  { field: "contingencyDeadline", type: "contingency" },
  { field: "walkthroughDate", type: "walkthrough" },
  { field: "closingDeadline", type: "closing" },
];

export async function createTransactionFromImport(input: {
  review: ImportReviewInput;
  documentIds: string[];
  extractionId: string;
  importAsArchived: boolean;
  documentSummaries?: Record<string, { summary?: string; confidenceScore?: number }>;
}) {
  const db = getDb();
  const { review, documentIds, extractionId, importAsArchived, documentSummaries } = input;
  const { listingSide, sellingSide } = getSideFlags(review.transactionType);
  const transactionStatus = resolveTransactionStatus(review, importAsArchived);
  const commissionFields = buildCommissionFields(review);

  const [transaction] = await db
    .insert(transactions)
    .values({
      transactionType: review.transactionType,
      propertyAddress: review.propertyAddress,
      city: review.city,
      state: review.state.toUpperCase(),
      zip: review.zip,
      purchasePrice: review.purchasePrice ?? null,
      closingDate: review.closingDate ? new Date(`${review.closingDate}T12:00:00`) : null,
      contractDate: review.contractDate ? new Date(`${review.contractDate}T12:00:00`) : null,
      earnestMoneyAmount: review.earnestMoneyAmount ?? null,
      earnestMoneyReceived: false,
      earnestMoneyHeldBy: review.earnestMoneyHeldBy ?? null,
      earnestMoneyHolderName: review.earnestMoneyHolderName ?? null,
      sellerConcessions: review.sellerConcessions ?? null,
      commissionExpected: commissionFields.commissionExpected,
      commissionPercentageBps: commissionFields.commissionPercentageBps,
      brokerageSplitBps: commissionFields.brokerageSplitBps,
      grossCommissionAmountCents: commissionFields.grossCommissionAmountCents,
      brokerageFeeAmountCents: commissionFields.brokerageFeeAmountCents,
      agentNetCommissionCents: commissionFields.agentNetCommissionCents,
      transactionStatus,
      listingSide,
      sellingSide,
      lenderName: review.lender ?? null,
      attorneyName: review.attorney ?? null,
      titleCompany: review.titleCompany ?? null,
      closingCompany: review.closingCompany ?? null,
      mlsNumber: review.mlsNumber ?? null,
      specialTerms: review.specialTerms ?? null,
      assignedUserId: review.assignedUserId,
      importedFromDocument: true,
      importConfidence: review.importConfidence ?? null,
      sourceDocumentCount: documentIds.length,
      archivedAt: importAsArchived ? new Date() : null,
      archiveReason: importAsArchived ? review.archiveReason ?? "ITI historical import" : null,
    })
    .returning();

  for (const buyerName of parseNamesList(review.buyerNames)) {
    const { firstName, lastName } = splitName(buyerName);
    await db.insert(contacts).values({
      contactType: "buyer",
      firstName,
      lastName,
    });
  }

  for (const sellerName of parseNamesList(review.sellerNames)) {
    const { firstName, lastName } = splitName(sellerName);
    await db.insert(contacts).values({
      contactType: "seller",
      firstName,
      lastName,
    });
  }

  if (review.lender?.trim()) {
    const { firstName, lastName } = splitName(review.lender);
    await db.insert(contacts).values({
      contactType: "lender",
      firstName,
      lastName,
      company: review.lender,
    });
  }

  if (review.titleCompany?.trim()) {
    await db.insert(contacts).values({
      contactType: "title_company",
      firstName: review.titleCompany,
      lastName: "Title",
      company: review.titleCompany,
    });
  }

  for (const { field, type } of deadlineFieldMap) {
    const dueDate = review[field];
    if (typeof dueDate === "string" && dueDate.trim()) {
      await db.insert(deadlines).values({
        title: `${type.replaceAll("_", " ")} deadline`,
        deadlineType: type,
        dueDate: new Date(`${dueDate}T12:00:00`),
        status: importAsArchived ? "complete" : "due_soon",
        completed: importAsArchived,
        transactionId: transaction.id,
      });
    }
  }

  const noteLines = [
    "Transaction imported via Intelligent Transaction Import.",
    review.buyerNames ? `Buyer: ${review.buyerNames}` : null,
    review.sellerNames ? `Seller: ${review.sellerNames}` : null,
    review.listingAgent ? `Listing agent: ${review.listingAgent}` : null,
    review.sellingAgent ? `Selling agent: ${review.sellingAgent}` : null,
    importAsArchived ? "Imported as archived/historical transaction." : null,
  ].filter(Boolean);

  await db.insert(notes).values({
    content: noteLines.join("\n"),
    noteScope: "transaction",
    transactionId: transaction.id,
    authorUserId: review.assignedUserId,
  });

  await confirmDocumentsForTransaction(documentIds, transaction.id, documentSummaries);
  await acceptAiExtraction(extractionId, transaction.id);

  return { id: transaction.id };
}
