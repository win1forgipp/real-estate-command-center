import { z } from "zod";

const confidenceSchema = z.enum(["high", "medium", "low", "missing"]);

const stringFieldSchema = z.object({
  value: z.string().nullable(),
  confidence: confidenceSchema,
});

const numberFieldSchema = z.object({
  value: z.number().nullable(),
  confidence: confidenceSchema,
});

export const itiDocumentExtractionSchema = z.object({
  document: z.object({
    documentType: z.enum([
      "purchase_agreement",
      "addendum",
      "amendment",
      "contingency_removal",
      "inspection_response",
      "repair_addendum",
      "closing_document",
      "other",
    ]),
    detectedDate: z.string().nullable(),
    summary: z.string().nullable(),
    confidenceScore: z.number(),
    pageReferences: z.array(z.string()),
  }),
  transaction: z.object({
    propertyAddress: stringFieldSchema,
    city: stringFieldSchema,
    state: stringFieldSchema,
    zip: stringFieldSchema,
    purchasePrice: numberFieldSchema,
    contractDate: stringFieldSchema,
    closingDate: stringFieldSchema,
    transactionType: stringFieldSchema,
    transactionStatus: stringFieldSchema,
    mlsNumber: stringFieldSchema,
    specialTerms: stringFieldSchema,
  }),
  parties: z.object({
    buyerNames: stringFieldSchema,
    sellerNames: stringFieldSchema,
    listingAgent: stringFieldSchema,
    sellingAgent: stringFieldSchema,
    listingBrokerage: stringFieldSchema,
    sellingBrokerage: stringFieldSchema,
  }),
  money: z.object({
    earnestMoneyAmount: numberFieldSchema,
    earnestMoneyHeldBy: stringFieldSchema,
    earnestMoneyHolderName: stringFieldSchema,
    sellerConcessions: numberFieldSchema,
    commission: numberFieldSchema,
  }),
  deadlines: z.object({
    inspectionDeadline: stringFieldSchema,
    financingDeadline: stringFieldSchema,
    appraisalDeadline: stringFieldSchema,
    earnestMoneyDueDate: stringFieldSchema,
    contingencyDeadline: stringFieldSchema,
    walkthroughDate: stringFieldSchema,
    closingDate: stringFieldSchema,
  }),
  serviceProviders: z.object({
    lender: stringFieldSchema,
    titleCompany: stringFieldSchema,
    closingCompany: stringFieldSchema,
    attorney: stringFieldSchema,
    inspector: stringFieldSchema,
  }),
  overallConfidence: z.number(),
  warnings: z.array(z.string()).optional(),
  conflicts: z.array(z.string()).optional(),
});

export type ItiValidatedDocumentExtraction = z.infer<typeof itiDocumentExtractionSchema>;

export function validateRawDocumentExtraction(raw: unknown, fileName: string) {
  const result = itiDocumentExtractionSchema.safeParse(raw);
  if (!result.success) {
    const summary = result.error.issues
      .slice(0, 3)
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new Error(
      `ITI received an invalid structured response for ${fileName}. ${summary || "Schema validation failed."}`,
    );
  }

  return result.data;
}
