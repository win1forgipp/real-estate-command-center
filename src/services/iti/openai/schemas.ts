const confidenceSchema = {
  type: "string",
  enum: ["high", "medium", "low", "missing"],
};

const stringFieldSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    value: { type: ["string", "null"] },
    confidence: confidenceSchema,
  },
  required: ["value", "confidence"],
};

const numberFieldSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    value: { type: ["number", "null"] },
    confidence: confidenceSchema,
  },
  required: ["value", "confidence"],
};

export const ITI_DOCUMENT_EXTRACTION_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    document: {
      type: "object",
      additionalProperties: false,
      properties: {
        documentType: {
          type: "string",
          enum: [
            "purchase_agreement",
            "addendum",
            "amendment",
            "contingency_removal",
            "inspection_response",
            "repair_addendum",
            "closing_document",
            "other",
          ],
        },
        detectedDate: { type: ["string", "null"] },
        summary: { type: ["string", "null"] },
        confidenceScore: { type: "number" },
        pageReferences: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: [
        "documentType",
        "detectedDate",
        "summary",
        "confidenceScore",
        "pageReferences",
      ],
    },
    transaction: {
      type: "object",
      additionalProperties: false,
      properties: {
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
      },
      required: [
        "propertyAddress",
        "city",
        "state",
        "zip",
        "purchasePrice",
        "contractDate",
        "closingDate",
        "transactionType",
        "transactionStatus",
        "mlsNumber",
        "specialTerms",
      ],
    },
    parties: {
      type: "object",
      additionalProperties: false,
      properties: {
        buyerNames: stringFieldSchema,
        sellerNames: stringFieldSchema,
        listingAgent: stringFieldSchema,
        sellingAgent: stringFieldSchema,
        listingBrokerage: stringFieldSchema,
        sellingBrokerage: stringFieldSchema,
      },
      required: [
        "buyerNames",
        "sellerNames",
        "listingAgent",
        "sellingAgent",
        "listingBrokerage",
        "sellingBrokerage",
      ],
    },
    money: {
      type: "object",
      additionalProperties: false,
      properties: {
        earnestMoneyAmount: numberFieldSchema,
        earnestMoneyHeldBy: stringFieldSchema,
        earnestMoneyHolderName: stringFieldSchema,
        sellerConcessions: numberFieldSchema,
        commission: numberFieldSchema,
      },
      required: [
        "earnestMoneyAmount",
        "earnestMoneyHeldBy",
        "earnestMoneyHolderName",
        "sellerConcessions",
        "commission",
      ],
    },
    deadlines: {
      type: "object",
      additionalProperties: false,
      properties: {
        inspectionDeadline: stringFieldSchema,
        financingDeadline: stringFieldSchema,
        appraisalDeadline: stringFieldSchema,
        earnestMoneyDueDate: stringFieldSchema,
        contingencyDeadline: stringFieldSchema,
        walkthroughDate: stringFieldSchema,
        closingDate: stringFieldSchema,
      },
      required: [
        "inspectionDeadline",
        "financingDeadline",
        "appraisalDeadline",
        "earnestMoneyDueDate",
        "contingencyDeadline",
        "walkthroughDate",
        "closingDate",
      ],
    },
    serviceProviders: {
      type: "object",
      additionalProperties: false,
      properties: {
        lender: stringFieldSchema,
        titleCompany: stringFieldSchema,
        closingCompany: stringFieldSchema,
        attorney: stringFieldSchema,
        inspector: stringFieldSchema,
      },
      required: ["lender", "titleCompany", "closingCompany", "attorney", "inspector"],
    },
    overallConfidence: { type: "number" },
  },
  required: [
    "document",
    "transaction",
    "parties",
    "money",
    "deadlines",
    "serviceProviders",
    "overallConfidence",
  ],
} as const;

export const ITI_DOCUMENT_EXTRACTION_PROMPT = `You are ITI (Intelligent Transaction Import) for a real estate command center.
Analyze the provided real estate document and extract structured transaction data.
Return only JSON matching the schema.
Use ISO dates YYYY-MM-DD. Money fields as integer dollar amounts without decimals.
transactionType values: buyer, seller, or dual.
earnestMoneyHeldBy values: sellers_brokerage, buyers_brokerage, other, or null.
Include page references when possible.
If a field is not present, return null with confidence missing.`;

export type ItiRawDocumentExtraction = {
  document: {
    documentType: string;
    detectedDate: string | null;
    summary: string | null;
    confidenceScore: number;
    pageReferences: string[];
  };
  transaction: Record<string, { value?: string | number | null; confidence?: string }>;
  parties: Record<string, { value?: string | null; confidence?: string }>;
  money: Record<string, { value?: string | number | null; confidence?: string }>;
  deadlines: Record<string, { value?: string | null; confidence?: string }>;
  serviceProviders: Record<string, { value?: string | null; confidence?: string }>;
  overallConfidence: number;
};

export function buildResponsesRequestBody(input: {
  model: string;
  fileId?: string;
  imageUrl?: string;
  fileName: string;
}) {
  const content: Array<
    | { type: "input_text"; text: string }
    | { type: "input_file"; file_id: string; detail: "high" }
    | { type: "input_image"; image_url: string; detail: "high" }
  > = [
    {
      type: "input_text",
      text: `${ITI_DOCUMENT_EXTRACTION_PROMPT}\n\nDocument filename: ${input.fileName}`,
    },
  ];

  if (input.fileId) {
    content.push({
      type: "input_file",
      file_id: input.fileId,
      detail: "high",
    });
  } else if (input.imageUrl) {
    content.push({
      type: "input_image",
      image_url: input.imageUrl,
      detail: "high",
    });
  }

  return {
    model: input.model,
    input: [
      {
        role: "user" as const,
        content,
      },
    ],
    text: {
      format: {
        type: "json_schema" as const,
        name: "iti_document_extraction",
        schema: ITI_DOCUMENT_EXTRACTION_JSON_SCHEMA,
        strict: true,
      },
    },
  };
}
