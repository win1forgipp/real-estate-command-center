export type ConfidenceLevel = "high" | "medium" | "low" | "missing";

export type ExtractedField<T = string> = {
  value: T | null;
  confidence: ConfidenceLevel;
};

export type DocumentType =
  | "purchase_agreement"
  | "addendum"
  | "amendment"
  | "contingency_removal"
  | "inspection_response"
  | "repair_addendum"
  | "closing_document"
  | "other";

export type UploadedDocumentMeta = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: DocumentType;
  storagePath: string;
};

export type ExtractedDocumentInfo = {
  fileName: string;
  documentType: DocumentType;
  detectedDate: string | null;
  summary: string | null;
  confidenceScore: number;
};

export type PurchaseAgreementExtraction = {
  transaction: {
    propertyAddress: ExtractedField;
    city: ExtractedField;
    state: ExtractedField;
    zip: ExtractedField;
    purchasePrice: ExtractedField<number>;
    contractDate: ExtractedField;
    closingDate: ExtractedField;
    transactionType: ExtractedField<"buyer" | "seller" | "dual">;
    transactionStatus: ExtractedField<string>;
    mlsNumber: ExtractedField;
    specialTerms: ExtractedField;
  };
  parties: {
    buyerNames: ExtractedField;
    sellerNames: ExtractedField;
    listingAgent: ExtractedField;
    sellingAgent: ExtractedField;
    listingBrokerage: ExtractedField;
    sellingBrokerage: ExtractedField;
  };
  money: {
    earnestMoneyAmount: ExtractedField<number>;
    earnestMoneyHeldBy: ExtractedField<"sellers_brokerage" | "buyers_brokerage" | "other">;
    earnestMoneyHolderName: ExtractedField;
    sellerConcessions: ExtractedField<number>;
    commission: ExtractedField<number>;
  };
  deadlines: {
    inspectionDeadline: ExtractedField;
    financingDeadline: ExtractedField;
    appraisalDeadline: ExtractedField;
    earnestMoneyDueDate: ExtractedField;
    contingencyDeadline: ExtractedField;
    walkthroughDate: ExtractedField;
    closingDate: ExtractedField;
  };
  serviceProviders: {
    lender: ExtractedField;
    titleCompany: ExtractedField;
    closingCompany: ExtractedField;
    attorney: ExtractedField;
    inspector: ExtractedField;
  };
  documents: ExtractedDocumentInfo[];
  archiveCandidate: {
    isCandidate: boolean;
    reasons: string[];
    suggestedImportMode: "active" | "archived";
  };
  overallConfidence: number;
  provider: string;
  setupRequired?: boolean;
  setupMessage?: string;
};

export type ExtractionInput = {
  documents: UploadedDocumentMeta[];
  documentText: string;
  useMock?: boolean;
};

export type ExtractionResult = {
  extraction: PurchaseAgreementExtraction;
  rawJson: string;
};
