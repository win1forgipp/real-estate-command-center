import "server-only";

import { detectItiDocumentType } from "@/services/iti/document-type";
import { field } from "@/services/iti/mock-provider";
import type { ItiRawDocumentExtraction } from "@/services/iti/openai/schemas";
import type { ItiValidatedDocumentExtraction } from "@/services/iti/openai/validate-extraction-schema";
import type {
  ItiConfidenceLevel,
  ItiDocumentType,
  ItiExtractionResult,
  ItiExtractedField,
  ItiUploadedDocumentMeta,
} from "@/services/iti/types";

function mergeField<T>(
  partial: { value?: T | string | number | null; confidence?: string } | undefined,
  fallback: T | null = null,
): ItiExtractedField<T> {
  const confidence = partial?.confidence;
  const validConfidence: ItiConfidenceLevel =
    confidence === "high" ||
    confidence === "medium" ||
    confidence === "low" ||
    confidence === "missing"
      ? confidence
      : partial?.value != null && partial.value !== ""
        ? "medium"
        : "missing";

  return field((partial?.value as T | null | undefined) ?? fallback, validConfidence);
}

export type ItiPerDocumentExtraction = {
  fileName: string;
  documentType: ItiDocumentType;
  detectedDate: string | null;
  summary: string | null;
  confidenceScore: number;
  pageReferences: string[];
  overallConfidence: number;
  transaction: ItiExtractionResult["transaction"];
  parties: ItiExtractionResult["parties"];
  money: ItiExtractionResult["money"];
  deadlines: ItiExtractionResult["deadlines"];
  serviceProviders: ItiExtractionResult["serviceProviders"];
  processingMethod: "openai_file" | "openai_image";
};

export function normalizeDocumentExtraction(input: {
  fileName: string;
  raw: ItiRawDocumentExtraction | ItiValidatedDocumentExtraction;
  processingMethod: ItiPerDocumentExtraction["processingMethod"];
}): ItiPerDocumentExtraction {
  const documentType = (input.raw.document?.documentType ??
    detectItiDocumentType(input.fileName)) as ItiDocumentType;

  return {
    fileName: input.fileName,
    documentType,
    detectedDate: input.raw.document?.detectedDate ?? null,
    summary: input.raw.document?.summary ?? null,
    confidenceScore: input.raw.document?.confidenceScore ?? input.raw.overallConfidence ?? 70,
    pageReferences: input.raw.document?.pageReferences ?? [],
    overallConfidence: input.raw.overallConfidence ?? 70,
    processingMethod: input.processingMethod,
    transaction: {
      propertyAddress: mergeField<string>(input.raw.transaction?.propertyAddress),
      city: mergeField<string>(input.raw.transaction?.city),
      state: mergeField<string>(input.raw.transaction?.state),
      zip: mergeField<string>(input.raw.transaction?.zip),
      purchasePrice: mergeField<number>(input.raw.transaction?.purchasePrice as never),
      contractDate: mergeField<string>(input.raw.transaction?.contractDate),
      closingDate: mergeField<string>(input.raw.transaction?.closingDate),
      transactionType: mergeField<"buyer" | "seller" | "dual">(
        input.raw.transaction?.transactionType as never,
        "buyer",
      ),
      transactionStatus: mergeField<string>(input.raw.transaction?.transactionStatus, "under_contract"),
      mlsNumber: mergeField<string>(input.raw.transaction?.mlsNumber),
      specialTerms: mergeField<string>(input.raw.transaction?.specialTerms),
    },
    parties: {
      buyerNames: mergeField<string>(input.raw.parties?.buyerNames),
      sellerNames: mergeField<string>(input.raw.parties?.sellerNames),
      listingAgent: mergeField<string>(input.raw.parties?.listingAgent),
      sellingAgent: mergeField<string>(input.raw.parties?.sellingAgent),
      listingBrokerage: mergeField<string>(input.raw.parties?.listingBrokerage),
      sellingBrokerage: mergeField<string>(input.raw.parties?.sellingBrokerage),
    },
    money: {
      earnestMoneyAmount: mergeField<number>(input.raw.money?.earnestMoneyAmount as never),
      earnestMoneyHeldBy: mergeField<"sellers_brokerage" | "buyers_brokerage" | "other">(
        input.raw.money?.earnestMoneyHeldBy as never,
      ),
      earnestMoneyHolderName: mergeField<string>(input.raw.money?.earnestMoneyHolderName),
      sellerConcessions: mergeField<number>(input.raw.money?.sellerConcessions as never),
      commission: mergeField<number>(input.raw.money?.commission as never),
    },
    deadlines: {
      inspectionDeadline: mergeField<string>(input.raw.deadlines?.inspectionDeadline),
      financingDeadline: mergeField<string>(input.raw.deadlines?.financingDeadline),
      appraisalDeadline: mergeField<string>(input.raw.deadlines?.appraisalDeadline),
      earnestMoneyDueDate: mergeField<string>(input.raw.deadlines?.earnestMoneyDueDate),
      contingencyDeadline: mergeField<string>(input.raw.deadlines?.contingencyDeadline),
      walkthroughDate: mergeField<string>(input.raw.deadlines?.walkthroughDate),
      closingDate: mergeField<string>(
        input.raw.deadlines?.closingDate ?? input.raw.transaction?.closingDate,
      ),
    },
    serviceProviders: {
      lender: mergeField<string>(input.raw.serviceProviders?.lender),
      titleCompany: mergeField<string>(input.raw.serviceProviders?.titleCompany),
      closingCompany: mergeField<string>(input.raw.serviceProviders?.closingCompany),
      attorney: mergeField<string>(input.raw.serviceProviders?.attorney),
      inspector: mergeField<string>(input.raw.serviceProviders?.inspector),
    },
  };
}

export function buildMockDocumentExtraction(
  document: ItiUploadedDocumentMeta,
): ItiPerDocumentExtraction {
  const documentType = detectItiDocumentType(document.fileName);

  return normalizeDocumentExtraction({
    fileName: document.fileName,
    processingMethod: "openai_file",
    raw: {
      document: {
        documentType,
        detectedDate: "2026-03-15",
        summary: `Mock extraction for ${document.fileName}`,
        confidenceScore: 78,
        pageReferences: ["1"],
      },
      transaction: {
        propertyAddress: { value: "142 Oak Lane", confidence: "high" },
        city: { value: "Richmond", confidence: "high" },
        state: { value: "VA", confidence: "high" },
        zip: { value: "23220", confidence: "high" },
        purchasePrice: { value: 425000, confidence: "high" },
        contractDate: { value: "2026-03-15", confidence: "high" },
        closingDate: { value: "2026-05-01", confidence: "high" },
        transactionType: { value: "buyer", confidence: "medium" },
        transactionStatus: { value: "under_contract", confidence: "medium" },
        mlsNumber: { value: "MLS-142-OAK", confidence: "low" },
        specialTerms: { value: "Seller to leave refrigerator.", confidence: "low" },
      },
      parties: {
        buyerNames: { value: "Alex Morgan and Jamie Morgan", confidence: "high" },
        sellerNames: { value: "Taylor Brooks", confidence: "high" },
        listingAgent: { value: "Pat Agent", confidence: "medium" },
        sellingAgent: { value: "Tim Agent", confidence: "medium" },
        listingBrokerage: { value: "Oak Realty", confidence: "medium" },
        sellingBrokerage: { value: "Command Center Realty", confidence: "medium" },
      },
      money: {
        earnestMoneyAmount: { value: 5000, confidence: "high" },
        earnestMoneyHeldBy: { value: "sellers_brokerage", confidence: "medium" },
        earnestMoneyHolderName: { value: null, confidence: "missing" },
        sellerConcessions: { value: 2500, confidence: "low" },
        commission: { value: 12750, confidence: "low" },
      },
      deadlines: {
        inspectionDeadline: { value: "2026-03-22", confidence: "high" },
        financingDeadline: { value: "2026-04-05", confidence: "high" },
        appraisalDeadline: { value: "2026-04-10", confidence: "medium" },
        earnestMoneyDueDate: { value: "2026-03-18", confidence: "high" },
        contingencyDeadline: { value: "2026-04-05", confidence: "medium" },
        walkthroughDate: { value: "2026-04-28", confidence: "low" },
        closingDate: { value: "2026-05-01", confidence: "high" },
      },
      serviceProviders: {
        lender: { value: "Blue Ridge Lending", confidence: "medium" },
        titleCompany: { value: "Commonwealth Title Group", confidence: "medium" },
        closingCompany: { value: "Commonwealth Title Group", confidence: "medium" },
        attorney: { value: "Taylor & Associates", confidence: "low" },
        inspector: { value: "HomeGuard Inspections", confidence: "low" },
      },
      overallConfidence: 78,
    },
  });
}
