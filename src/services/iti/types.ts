/**
 * ITI (Intelligent Transaction Import) — canonical types.
 */
export type ItiConfidenceLevel = "high" | "medium" | "low" | "missing";

export type ItiExtractedField<T = string> = {
  value: T | null;
  confidence: ItiConfidenceLevel;
};

export type ItiDocumentType =
  | "purchase_agreement"
  | "addendum"
  | "amendment"
  | "contingency_removal"
  | "inspection_response"
  | "repair_addendum"
  | "closing_document"
  | "other";

export type ItiUploadedDocumentMeta = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: ItiDocumentType;
  storagePath: string;
};

export type ItiExtractedDocumentInfo = {
  fileName: string;
  documentType: ItiDocumentType;
  detectedDate: string | null;
  summary: string | null;
  confidenceScore: number;
};

export type ItiExtractionResult = {
  transaction: {
    propertyAddress: ItiExtractedField;
    city: ItiExtractedField;
    state: ItiExtractedField;
    zip: ItiExtractedField;
    purchasePrice: ItiExtractedField<number>;
    contractDate: ItiExtractedField;
    closingDate: ItiExtractedField;
    transactionType: ItiExtractedField<"buyer" | "seller" | "dual">;
    transactionStatus: ItiExtractedField<string>;
    mlsNumber: ItiExtractedField;
    specialTerms: ItiExtractedField;
  };
  parties: {
    buyerNames: ItiExtractedField;
    sellerNames: ItiExtractedField;
    listingAgent: ItiExtractedField;
    sellingAgent: ItiExtractedField;
    listingBrokerage: ItiExtractedField;
    sellingBrokerage: ItiExtractedField;
  };
  money: {
    earnestMoneyAmount: ItiExtractedField<number>;
    earnestMoneyHeldBy: ItiExtractedField<"sellers_brokerage" | "buyers_brokerage" | "other">;
    earnestMoneyHolderName: ItiExtractedField;
    sellerConcessions: ItiExtractedField<number>;
    commission: ItiExtractedField<number>;
  };
  deadlines: {
    inspectionDeadline: ItiExtractedField;
    financingDeadline: ItiExtractedField;
    appraisalDeadline: ItiExtractedField;
    earnestMoneyDueDate: ItiExtractedField;
    contingencyDeadline: ItiExtractedField;
    walkthroughDate: ItiExtractedField;
    closingDate: ItiExtractedField;
  };
  serviceProviders: {
    lender: ItiExtractedField;
    titleCompany: ItiExtractedField;
    closingCompany: ItiExtractedField;
    attorney: ItiExtractedField;
    inspector: ItiExtractedField;
  };
  documents: ItiExtractedDocumentInfo[];
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

export type ItiExtractionInput = {
  documents: ItiUploadedDocumentMeta[];
  documentText: string;
  useMock?: boolean;
};

export type ItiProviderResult = {
  extraction: ItiExtractionResult;
  rawJson: string;
};

export type ItiProcessedFileStatus =
  | "waiting"
  | "uploading"
  | "processing"
  | "parsed_successfully"
  | "review_suggested"
  | "unknown_document"
  | "failed";

export type ItiProcessedFileResult = {
  fileName: string;
  fileType: string;
  fileSize: number;
  status: ItiProcessedFileStatus;
  documentId?: string;
  error?: string;
};

export type RunItiExtractionResponse = {
  ok: boolean;
  error?: string;
  warning?: string;
  provider?: "openai" | "mock";
  extractionId?: string;
  documentIds?: string[];
  extraction?: ItiExtractionResult;
  files?: ItiProcessedFileResult[];
};

/** @deprecated Use RunItiExtractionResponse */
export type RunItiResult = {
  extractionId: string;
  documentIds: string[];
  extraction: ItiExtractionResult;
  setupMessage?: string;
};

/** @deprecated Use ItiExtractionResult */
export type PurchaseAgreementExtraction = ItiExtractionResult;
