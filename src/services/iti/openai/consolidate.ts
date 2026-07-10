import type { ItiPerDocumentExtraction } from "@/services/iti/openai/normalize";
import type {
  ItiConfidenceLevel,
  ItiDocumentType,
  ItiExtractionResult,
  ItiExtractedField,
} from "@/services/iti/types";

export type ItiFieldConflict = {
  field: string;
  values: Array<{ fileName: string; value: string | null }>;
  effectiveValue: string | null;
  controllingFileName: string;
};

const DOCUMENT_PRIORITY: Record<ItiDocumentType, number> = {
  amendment: 100,
  addendum: 90,
  repair_addendum: 85,
  contingency_removal: 80,
  inspection_response: 70,
  purchase_agreement: 50,
  closing_document: 40,
  other: 10,
};

function confidenceRank(confidence: ItiConfidenceLevel) {
  switch (confidence) {
    case "high":
      return 4;
    case "medium":
      return 3;
    case "low":
      return 2;
    default:
      return 0;
  }
}

function formatFieldValue(value: unknown) {
  if (value == null || value === "") {
    return null;
  }

  return String(value);
}

function chooseControllingDocument(documents: ItiPerDocumentExtraction[]) {
  return [...documents].sort((left, right) => {
    const priorityDelta =
      DOCUMENT_PRIORITY[right.documentType] - DOCUMENT_PRIORITY[left.documentType];
    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return right.confidenceScore - left.confidenceScore;
  })[0];
}

function mergeScalarField<T>(
  documents: ItiPerDocumentExtraction[],
  selector: (doc: ItiPerDocumentExtraction) => ItiExtractedField<T>,
  fieldName: string,
  conflicts: ItiFieldConflict[],
): ItiExtractedField<T> {
  const candidates = documents
    .map((doc) => ({
      fileName: doc.fileName,
      field: selector(doc),
      priority: DOCUMENT_PRIORITY[doc.documentType],
    }))
    .filter((candidate) => candidate.field.value != null && candidate.field.value !== "");

  if (!candidates.length) {
    return { value: null, confidence: "missing" };
  }

  const uniqueValues = new Map<string, Array<{ fileName: string; value: string | null }>>();
  for (const candidate of candidates) {
    const key = formatFieldValue(candidate.field.value) ?? "";
    const existing = uniqueValues.get(key) ?? [];
    existing.push({
      fileName: candidate.fileName,
      value: formatFieldValue(candidate.field.value),
    });
    uniqueValues.set(key, existing);
  }

  const sorted = [...candidates].sort((left, right) => {
    const priorityDelta = right.priority - left.priority;
    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return confidenceRank(right.field.confidence) - confidenceRank(left.field.confidence);
  });

  const winner = sorted[0];

  if (uniqueValues.size > 1) {
    conflicts.push({
      field: fieldName,
      values: [...uniqueValues.values()].flat(),
      effectiveValue: formatFieldValue(winner.field.value),
      controllingFileName: winner.fileName,
    });
  }

  return winner.field;
}

export function consolidateDocumentExtractions(
  documents: ItiPerDocumentExtraction[],
): { extraction: ItiExtractionResult; conflicts: ItiFieldConflict[] } {
  const conflicts: ItiFieldConflict[] = [];
  const controllingDocument = chooseControllingDocument(documents);

  const extraction: ItiExtractionResult = {
    transaction: {
      propertyAddress: mergeScalarField(
        documents,
        (doc) => doc.transaction.propertyAddress,
        "transaction.propertyAddress",
        conflicts,
      ),
      city: mergeScalarField(documents, (doc) => doc.transaction.city, "transaction.city", conflicts),
      state: mergeScalarField(
        documents,
        (doc) => doc.transaction.state,
        "transaction.state",
        conflicts,
      ),
      zip: mergeScalarField(documents, (doc) => doc.transaction.zip, "transaction.zip", conflicts),
      purchasePrice: mergeScalarField(
        documents,
        (doc) => doc.transaction.purchasePrice,
        "transaction.purchasePrice",
        conflicts,
      ),
      contractDate: mergeScalarField(
        documents,
        (doc) => doc.transaction.contractDate,
        "transaction.contractDate",
        conflicts,
      ),
      closingDate: mergeScalarField(
        documents,
        (doc) => doc.transaction.closingDate,
        "transaction.closingDate",
        conflicts,
      ),
      transactionType: mergeScalarField(
        documents,
        (doc) => doc.transaction.transactionType,
        "transaction.transactionType",
        conflicts,
      ),
      transactionStatus: mergeScalarField(
        documents,
        (doc) => doc.transaction.transactionStatus,
        "transaction.transactionStatus",
        conflicts,
      ),
      mlsNumber: mergeScalarField(
        documents,
        (doc) => doc.transaction.mlsNumber,
        "transaction.mlsNumber",
        conflicts,
      ),
      specialTerms: mergeScalarField(
        documents,
        (doc) => doc.transaction.specialTerms,
        "transaction.specialTerms",
        conflicts,
      ),
    },
    parties: {
      buyerNames: mergeScalarField(
        documents,
        (doc) => doc.parties.buyerNames,
        "parties.buyerNames",
        conflicts,
      ),
      sellerNames: mergeScalarField(
        documents,
        (doc) => doc.parties.sellerNames,
        "parties.sellerNames",
        conflicts,
      ),
      listingAgent: mergeScalarField(
        documents,
        (doc) => doc.parties.listingAgent,
        "parties.listingAgent",
        conflicts,
      ),
      sellingAgent: mergeScalarField(
        documents,
        (doc) => doc.parties.sellingAgent,
        "parties.sellingAgent",
        conflicts,
      ),
      listingBrokerage: mergeScalarField(
        documents,
        (doc) => doc.parties.listingBrokerage,
        "parties.listingBrokerage",
        conflicts,
      ),
      sellingBrokerage: mergeScalarField(
        documents,
        (doc) => doc.parties.sellingBrokerage,
        "parties.sellingBrokerage",
        conflicts,
      ),
    },
    money: {
      earnestMoneyAmount: mergeScalarField(
        documents,
        (doc) => doc.money.earnestMoneyAmount,
        "money.earnestMoneyAmount",
        conflicts,
      ),
      earnestMoneyHeldBy: mergeScalarField(
        documents,
        (doc) => doc.money.earnestMoneyHeldBy,
        "money.earnestMoneyHeldBy",
        conflicts,
      ),
      earnestMoneyHolderName: mergeScalarField(
        documents,
        (doc) => doc.money.earnestMoneyHolderName,
        "money.earnestMoneyHolderName",
        conflicts,
      ),
      sellerConcessions: mergeScalarField(
        documents,
        (doc) => doc.money.sellerConcessions,
        "money.sellerConcessions",
        conflicts,
      ),
      commission: mergeScalarField(
        documents,
        (doc) => doc.money.commission,
        "money.commission",
        conflicts,
      ),
    },
    deadlines: {
      inspectionDeadline: mergeScalarField(
        documents,
        (doc) => doc.deadlines.inspectionDeadline,
        "deadlines.inspectionDeadline",
        conflicts,
      ),
      financingDeadline: mergeScalarField(
        documents,
        (doc) => doc.deadlines.financingDeadline,
        "deadlines.financingDeadline",
        conflicts,
      ),
      appraisalDeadline: mergeScalarField(
        documents,
        (doc) => doc.deadlines.appraisalDeadline,
        "deadlines.appraisalDeadline",
        conflicts,
      ),
      earnestMoneyDueDate: mergeScalarField(
        documents,
        (doc) => doc.deadlines.earnestMoneyDueDate,
        "deadlines.earnestMoneyDueDate",
        conflicts,
      ),
      contingencyDeadline: mergeScalarField(
        documents,
        (doc) => doc.deadlines.contingencyDeadline,
        "deadlines.contingencyDeadline",
        conflicts,
      ),
      walkthroughDate: mergeScalarField(
        documents,
        (doc) => doc.deadlines.walkthroughDate,
        "deadlines.walkthroughDate",
        conflicts,
      ),
      closingDate: mergeScalarField(
        documents,
        (doc) => doc.deadlines.closingDate,
        "deadlines.closingDate",
        conflicts,
      ),
    },
    serviceProviders: {
      lender: mergeScalarField(
        documents,
        (doc) => doc.serviceProviders.lender,
        "serviceProviders.lender",
        conflicts,
      ),
      titleCompany: mergeScalarField(
        documents,
        (doc) => doc.serviceProviders.titleCompany,
        "serviceProviders.titleCompany",
        conflicts,
      ),
      closingCompany: mergeScalarField(
        documents,
        (doc) => doc.serviceProviders.closingCompany,
        "serviceProviders.closingCompany",
        conflicts,
      ),
      attorney: mergeScalarField(
        documents,
        (doc) => doc.serviceProviders.attorney,
        "serviceProviders.attorney",
        conflicts,
      ),
      inspector: mergeScalarField(
        documents,
        (doc) => doc.serviceProviders.inspector,
        "serviceProviders.inspector",
        conflicts,
      ),
    },
    documents: documents.map((doc) => ({
      fileName: doc.fileName,
      documentType: doc.documentType,
      detectedDate: doc.detectedDate,
      summary: doc.summary,
      confidenceScore: doc.confidenceScore,
    })),
    archiveCandidate: {
      isCandidate: false,
      reasons: [],
      suggestedImportMode: "active",
    },
    overallConfidence: Math.round(
      documents.reduce((sum, doc) => sum + doc.overallConfidence, 0) / documents.length,
    ),
    provider: "openai",
  };

  if (controllingDocument && conflicts.length) {
    extraction.transaction.specialTerms = {
      value: [
        extraction.transaction.specialTerms.value,
        `Controlling document: ${controllingDocument.fileName}.`,
        ...conflicts.map(
          (conflict) =>
            `${conflict.field} conflict resolved to ${conflict.effectiveValue ?? "null"} from ${conflict.controllingFileName}.`,
        ),
      ]
        .filter(Boolean)
        .join(" "),
      confidence: "medium",
    };
  }

  const closingDate = extraction.transaction.closingDate.value;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (closingDate) {
    const closing = new Date(`${closingDate}T12:00:00`);
    if (closing < today) {
      extraction.archiveCandidate = {
        isCandidate: true,
        reasons: ["Closing date is before today."],
        suggestedImportMode: "archived",
      };
    }
  }

  return { extraction, conflicts };
}

export { DOCUMENT_PRIORITY };
