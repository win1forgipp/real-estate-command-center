import "server-only";

import type {
  ItiConfidenceLevel,
  ItiDocumentType,
  ItiExtractionInput,
  ItiExtractionResult,
  ItiExtractedField,
  ItiProviderResult,
} from "@/services/iti/types";
import { detectItiDocumentType } from "@/services/iti/document-parser";

function field<T = string>(
  value: T | null | undefined,
  confidence: ItiConfidenceLevel = value ? "high" : "missing",
): ItiExtractedField<T> {
  return {
    value: value ?? null,
    confidence: value == null || value === "" ? "missing" : confidence,
  };
}

function isArchivedCandidate(documents: ItiExtractionInput["documents"]) {
  const reasons: string[] = [];

  const hasClosingDoc = documents.some(
    (doc) =>
      detectItiDocumentType(doc.fileName) === "closing_document" ||
      /closed|archived|settlement|final/i.test(doc.fileName),
  );

  if (hasClosingDoc) {
    reasons.push("Closing or settlement documents detected.");
  }

  if (documents.some((doc) => /archived|closed|historical|past/i.test(doc.fileName))) {
    reasons.push("Uploaded filenames suggest a historical transaction.");
  }

  return {
    isCandidate: reasons.length > 0,
    reasons,
    suggestedImportMode: reasons.length > 0 ? ("archived" as const) : ("active" as const),
  };
}

function buildActiveFixture(): ItiExtractionResult {
  return {
    transaction: {
      propertyAddress: field("142 Oak Lane"),
      city: field("Richmond"),
      state: field("VA"),
      zip: field("23220"),
      purchasePrice: field(425000, "high"),
      contractDate: field("2026-02-15"),
      closingDate: field("2026-03-28"),
      transactionType: field("buyer", "medium"),
      transactionStatus: field("under_contract", "medium"),
      mlsNumber: field("MLS-142-OAK", "low"),
      specialTerms: field("Seller to leave refrigerator.", "low"),
    },
    parties: {
      buyerNames: field("Johnson Family"),
      sellerNames: field("Smith Family"),
      listingAgent: field("Pat Agent"),
      sellingAgent: field("Tim Agent"),
      listingBrokerage: field("Oak Realty"),
      sellingBrokerage: field("Command Center Realty"),
    },
    money: {
      earnestMoneyAmount: field(5000, "high"),
      earnestMoneyHeldBy: field("sellers_brokerage", "medium"),
      earnestMoneyHolderName: field<string>(null),
      sellerConcessions: field(2500, "low"),
      commission: field(12750, "low"),
    },
    deadlines: {
      inspectionDeadline: field("2026-02-22"),
      financingDeadline: field("2026-03-01"),
      appraisalDeadline: field("2026-03-05"),
      earnestMoneyDueDate: field("2026-02-18"),
      contingencyDeadline: field("2026-03-01"),
      walkthroughDate: field("2026-03-27"),
      closingDate: field("2026-03-28"),
    },
    serviceProviders: {
      lender: field("Blue Ridge Lending"),
      titleCompany: field("Commonwealth Title Group"),
      closingCompany: field("Commonwealth Title Group"),
      attorney: field("Taylor & Associates"),
      inspector: field("HomeGuard Inspections"),
    },
    documents: [],
    archiveCandidate: {
      isCandidate: false,
      reasons: [],
      suggestedImportMode: "active",
    },
    overallConfidence: 78,
    provider: "mock",
  };
}

function buildArchivedFixture(): ItiExtractionResult {
  const extraction = buildActiveFixture();
  extraction.transaction.closingDate = field("2024-11-15", "high");
  extraction.transaction.contractDate = field("2024-09-01", "high");
  extraction.transaction.transactionStatus = field("closed", "high");
  extraction.deadlines.closingDate = field("2024-11-15", "high");
  extraction.archiveCandidate = {
    isCandidate: true,
    reasons: [
      "Closing date is before today.",
      "Closing or settlement documents detected.",
    ],
    suggestedImportMode: "archived",
  };
  extraction.overallConfidence = 82;
  return extraction;
}

export const mockItiProvider = {
  name: "mock",
  isConfigured: true,
  async extract(input: ItiExtractionInput): Promise<ItiProviderResult> {
    const archivedHint =
      input.useMock ||
      input.documents.some((doc) =>
        /archived|closed|settlement|historical|past/i.test(doc.fileName),
      );

    const extraction = archivedHint ? buildArchivedFixture() : buildActiveFixture();
    const archiveCheck = isArchivedCandidate(input.documents);
    if (archiveCheck.isCandidate) {
      extraction.archiveCandidate = archiveCheck;
    }

    extraction.documents = input.documents.map((doc) => ({
      fileName: doc.fileName,
      documentType: detectItiDocumentType(doc.fileName) as ItiDocumentType,
      detectedDate: null,
      summary: `ITI mock summary for ${doc.fileName}`,
      confidenceScore: 70,
    }));

    extraction.setupMessage =
      "ITI is running in mock mode. Add OPENAI_API_KEY for live extraction.";

    return { extraction, rawJson: JSON.stringify(extraction) };
  },
};

export { field, isArchivedCandidate, detectItiDocumentType };
