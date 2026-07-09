import "server-only";

import OpenAI from "openai";

import {
  detectDocumentType,
  field,
  isArchivedCandidate,
} from "@/services/ai-extraction/mock-extractor";
import type {
  ExtractionInput,
  ExtractionResult,
  PurchaseAgreementExtraction,
} from "@/services/ai-extraction/types";

const EXTRACTION_SYSTEM_PROMPT = `You extract structured real estate transaction data from purchase agreement text.
Return JSON matching this shape with value and confidence (high|medium|low|missing) for each field.
Use ISO dates YYYY-MM-DD. Use integer cents for money fields omitted - use dollar amounts as integers without decimals.
transactionType must be buyer, seller, or dual.
earnestMoneyHeldBy must be sellers_brokerage, buyers_brokerage, other, or null.`;

function parseOpenAiJson(content: string): Partial<PurchaseAgreementExtraction> {
  try {
    return JSON.parse(content) as Partial<PurchaseAgreementExtraction>;
  } catch {
    return {};
  }
}

function mergeField<T>(
  partial: { value?: T | null; confidence?: string } | undefined,
  fallback: T | null = null,
) {
  const confidence = partial?.confidence;
  const validConfidence =
    confidence === "high" ||
    confidence === "medium" ||
    confidence === "low" ||
    confidence === "missing"
      ? confidence
      : partial?.value
        ? "medium"
        : "missing";

  return field(partial?.value ?? fallback, validConfidence);
}

function normalizeExtraction(
  raw: Partial<PurchaseAgreementExtraction>,
  documents: ExtractionInput["documents"],
): PurchaseAgreementExtraction {
  const archiveFromDocs = isArchivedCandidate(documents);
  const closingDate = raw.transaction?.closingDate?.value ?? null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let archiveCandidate = raw.archiveCandidate ?? archiveFromDocs;

  if (closingDate) {
    const closing = new Date(`${closingDate}T12:00:00`);
    if (closing < today) {
      archiveCandidate = {
        isCandidate: true,
        reasons: [
          ...archiveCandidate.reasons,
          "Closing date is before today.",
        ],
        suggestedImportMode: "archived",
      };
    }
  }

  const extraction: PurchaseAgreementExtraction = {
    transaction: {
      propertyAddress: mergeField(raw.transaction?.propertyAddress),
      city: mergeField(raw.transaction?.city),
      state: mergeField(raw.transaction?.state),
      zip: mergeField(raw.transaction?.zip),
      purchasePrice: mergeField<number>(raw.transaction?.purchasePrice as never),
      contractDate: mergeField(raw.transaction?.contractDate),
      closingDate: mergeField(raw.transaction?.closingDate),
      transactionType: mergeField<"buyer" | "seller" | "dual">(
        raw.transaction?.transactionType as never,
        "buyer",
      ),
      transactionStatus: mergeField(raw.transaction?.transactionStatus, "under_contract"),
      mlsNumber: mergeField(raw.transaction?.mlsNumber),
      specialTerms: mergeField(raw.transaction?.specialTerms),
    },
    parties: {
      buyerNames: mergeField(raw.parties?.buyerNames),
      sellerNames: mergeField(raw.parties?.sellerNames),
      listingAgent: mergeField(raw.parties?.listingAgent),
      sellingAgent: mergeField(raw.parties?.sellingAgent),
      listingBrokerage: mergeField(raw.parties?.listingBrokerage),
      sellingBrokerage: mergeField(raw.parties?.sellingBrokerage),
    },
    money: {
      earnestMoneyAmount: mergeField<number>(raw.money?.earnestMoneyAmount as never),
      earnestMoneyHeldBy: mergeField<"sellers_brokerage" | "buyers_brokerage" | "other">(
        raw.money?.earnestMoneyHeldBy as never,
      ),
      earnestMoneyHolderName: mergeField(raw.money?.earnestMoneyHolderName),
      sellerConcessions: mergeField<number>(raw.money?.sellerConcessions as never),
      commission: mergeField<number>(raw.money?.commission as never),
    },
    deadlines: {
      inspectionDeadline: mergeField(raw.deadlines?.inspectionDeadline),
      financingDeadline: mergeField(raw.deadlines?.financingDeadline),
      appraisalDeadline: mergeField(raw.deadlines?.appraisalDeadline),
      earnestMoneyDueDate: mergeField(raw.deadlines?.earnestMoneyDueDate),
      contingencyDeadline: mergeField(raw.deadlines?.contingencyDeadline),
      walkthroughDate: mergeField(raw.deadlines?.walkthroughDate),
      closingDate: mergeField(raw.deadlines?.closingDate ?? raw.transaction?.closingDate),
    },
    serviceProviders: {
      lender: mergeField(raw.serviceProviders?.lender),
      titleCompany: mergeField(raw.serviceProviders?.titleCompany),
      closingCompany: mergeField(raw.serviceProviders?.closingCompany),
      attorney: mergeField(raw.serviceProviders?.attorney),
      inspector: mergeField(raw.serviceProviders?.inspector),
    },
    documents: documents.map((doc) => ({
      fileName: doc.fileName,
      documentType: detectDocumentType(doc.fileName),
      detectedDate: null,
      summary: `Extracted from ${doc.fileName}`,
      confidenceScore: 75,
    })),
    archiveCandidate,
    overallConfidence: raw.overallConfidence ?? 70,
    provider: "openai",
  };

  return extraction;
}

export const openAiExtractionProvider = {
  name: "openai",
  isConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
  setupMessage: "Add OPENAI_API_KEY to enable live AI extraction.",
  async extract(input: ExtractionInput): Promise<ExtractionResult> {
    if (!process.env.OPENAI_API_KEY?.trim()) {
      const { mockExtractionProvider } = await import(
        "@/services/ai-extraction/mock-extractor"
      );
      const result = await mockExtractionProvider.extract(input);
      result.extraction.setupRequired = true;
      result.extraction.setupMessage =
        "OPENAI_API_KEY is not configured. Showing mock extraction results.";
      return result;
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Document filenames: ${input.documents.map((d) => d.fileName).join(", ")}\n\nDocument text:\n${input.documentText.slice(0, 120000)}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const parsed = parseOpenAiJson(content);
    const extraction = normalizeExtraction(parsed, input.documents);
    return { extraction, rawJson: JSON.stringify(extraction) };
  },
};
