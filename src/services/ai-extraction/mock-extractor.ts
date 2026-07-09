import type {
  ConfidenceLevel,
  DocumentType,
  ExtractedField,
  ExtractionInput,
  ExtractionResult,
  PurchaseAgreementExtraction,
} from "@/services/ai-extraction/types";

function field<T = string>(
  value: T | null | undefined,
  confidence: ConfidenceLevel = value ? "high" : "missing",
): ExtractedField<T> {
  return {
    value: value ?? null,
    confidence: value == null || value === "" ? "missing" : confidence,
  };
}

function detectDocumentType(fileName: string): DocumentType {
  const lower = fileName.toLowerCase();

  if (lower.includes("purchase") || lower.includes("contract") || lower.includes("psa")) {
    return "purchase_agreement";
  }

  if (lower.includes("addendum")) {
    return lower.includes("repair") ? "repair_addendum" : "addendum";
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

function isArchivedCandidate(documents: ExtractionInput["documents"]) {
  const reasons: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const hasClosingDoc = documents.some(
    (doc) =>
      detectDocumentType(doc.fileName) === "closing_document" ||
      /closed|archived|settlement|final/i.test(doc.fileName),
  );

  if (hasClosingDoc) {
    reasons.push("Closing or settlement documents detected.");
  }

  const archivedFilename = documents.some((doc) =>
    /archived|closed|historical|past/i.test(doc.fileName),
  );

  if (archivedFilename) {
    reasons.push("Uploaded filenames suggest a historical transaction.");
  }

  return {
    isCandidate: reasons.length > 0,
    reasons,
    suggestedImportMode: reasons.length > 0 ? ("archived" as const) : ("active" as const),
  };
}

function buildActiveFixture(): PurchaseAgreementExtraction {
  const archiveCandidate = {
    isCandidate: false,
    reasons: [] as string[],
    suggestedImportMode: "active" as const,
  };

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
    archiveCandidate,
    overallConfidence: 78,
    provider: "mock",
    setupMessage: "Mock extraction used for development and testing.",
  };
}

function buildArchivedFixture(): PurchaseAgreementExtraction {
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

function attachDocumentSummaries(
  extraction: PurchaseAgreementExtraction,
  documents: ExtractionInput["documents"],
) {
  extraction.documents = documents.map((doc) => {
    const documentType = detectDocumentType(doc.fileName);
    return {
      fileName: doc.fileName,
      documentType,
      detectedDate: null,
      summary: `Mock summary for ${doc.fileName}`,
      confidenceScore: 70,
    };
  });
}

export const mockExtractionProvider = {
  name: "mock",
  isConfigured: true,
  setupMessage: "Using mock extraction. Set OPENAI_API_KEY for live AI extraction.",
  async extract(input: ExtractionInput): Promise<ExtractionResult> {
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

    attachDocumentSummaries(extraction, input.documents);

    const rawJson = JSON.stringify(extraction);
    return { extraction, rawJson };
  },
};

export { detectDocumentType, field, isArchivedCandidate };
