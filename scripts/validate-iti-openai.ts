import assert from "node:assert/strict";

import { consolidateDocumentExtractions } from "../src/services/iti/openai/consolidate";
import {
  OPENAI_FILE_MAX_BYTES,
  getItiPdfProcessingMode,
  modelSupportsFileInputs,
  validateOpenAiFileSize,
  validateOpenAiRequestBatchSize,
} from "../src/services/iti/openai/config";
import { ItiOpenAiError, mapOpenAiError } from "../src/services/iti/openai/errors";
import { buildResponsesRequestBody } from "../src/services/iti/openai/schemas";
import type { ItiPerDocumentExtraction } from "../src/services/iti/openai/normalize";

function buildSampleExtraction(
  fileName: string,
  documentType: ItiPerDocumentExtraction["documentType"],
  closingDate: string,
): ItiPerDocumentExtraction {
  const field = <T,>(value: T) => ({ value, confidence: "high" as const });

  return {
    fileName,
    documentType,
    detectedDate: "2026-03-15",
    summary: `Sample ${fileName}`,
    confidenceScore: 80,
    pageReferences: ["1"],
    overallConfidence: 80,
    processingMethod: "openai_file",
    transaction: {
      propertyAddress: field("142 Oak Lane"),
      city: field("Richmond"),
      state: field("VA"),
      zip: field("23220"),
      purchasePrice: field(425000),
      contractDate: field("2026-03-15"),
      closingDate: field(closingDate),
      transactionType: field("buyer"),
      transactionStatus: field("under_contract"),
      mlsNumber: field("MLS-1"),
      specialTerms: field(null),
    },
    parties: {
      buyerNames: field("Buyer"),
      sellerNames: field("Seller"),
      listingAgent: field("Listing Agent"),
      sellingAgent: field("Selling Agent"),
      listingBrokerage: field("Listing Brokerage"),
      sellingBrokerage: field("Selling Brokerage"),
    },
    money: {
      earnestMoneyAmount: field(5000),
      earnestMoneyHeldBy: field("sellers_brokerage"),
      earnestMoneyHolderName: field(null),
      sellerConcessions: field(null),
      commission: field(null),
    },
    deadlines: {
      inspectionDeadline: field("2026-03-22"),
      financingDeadline: field("2026-04-05"),
      appraisalDeadline: field("2026-04-10"),
      earnestMoneyDueDate: field("2026-03-18"),
      contingencyDeadline: field("2026-04-05"),
      walkthroughDate: field("2026-04-28"),
      closingDate: field(closingDate),
    },
    serviceProviders: {
      lender: field("Lender"),
      titleCompany: field("Title"),
      closingCompany: field("Closing"),
      attorney: field("Attorney"),
      inspector: field("Inspector"),
    },
  };
}

function testPdfProcessingModeDefault() {
  const previous = process.env.ITI_PDF_PROCESSING_MODE;
  delete process.env.ITI_PDF_PROCESSING_MODE;
  assert.equal(getItiPdfProcessingMode(), "openai_file");
  process.env.ITI_PDF_PROCESSING_MODE = previous;
}

function testModelSupportsFileInputs() {
  assert.equal(modelSupportsFileInputs("gpt-4o"), true);
  assert.equal(modelSupportsFileInputs("gpt-4.1-mini"), true);
  assert.equal(modelSupportsFileInputs("text-davinci-003"), false);
}

function testOpenAiFileSizeValidation() {
  const ok = validateOpenAiFileSize(OPENAI_FILE_MAX_BYTES - 1, "contract.pdf");
  assert.equal(ok.ok, true);

  const failed = validateOpenAiFileSize(OPENAI_FILE_MAX_BYTES + 1, "contract.pdf");
  assert.equal(failed.ok, false);
}

function testOpenAiBatchSizeValidation() {
  const failed = validateOpenAiRequestBatchSize(OPENAI_FILE_MAX_BYTES + 1);
  assert.equal(failed.ok, false);
}

function testResponsesRequestShapeForPdf() {
  const body = buildResponsesRequestBody({
    model: "gpt-4o",
    fileName: "purchase-agreement.pdf",
    fileId: "file-123",
  });

  assert.equal(body.model, "gpt-4o");
  assert.equal(body.input[0]?.role, "user");
  const content = body.input[0]?.content as Array<{ type: string; file_id?: string; detail?: string }>;
  assert.equal(content[1]?.type, "input_file");
  assert.equal(content[1]?.file_id, "file-123");
  assert.equal(content[1]?.detail, "high");
  assert.equal(body.text.format.type, "json_schema");
}

function testResponsesRequestShapeForImage() {
  const body = buildResponsesRequestBody({
    model: "gpt-4o",
    fileName: "scan.jpg",
    imageUrl: "data:image/jpeg;base64,abc",
  });

  const content = body.input[0]?.content as Array<{ type: string; image_url?: string; detail?: string }>;
  assert.equal(content[1]?.type, "input_image");
  assert.equal(content[1]?.detail, "high");
}

function testConsolidationPrefersAmendmentClosingDate() {
  const purchase = buildSampleExtraction("purchase-agreement.pdf", "purchase_agreement", "2026-08-01");
  const amendment = buildSampleExtraction("amendment-1.pdf", "amendment", "2026-08-15");

  const { extraction, conflicts } = consolidateDocumentExtractions([purchase, amendment]);

  assert.equal(extraction.transaction.closingDate.value, "2026-08-15");
  assert.ok(conflicts.some((conflict) => conflict.field === "transaction.closingDate"));
}

function testOpenAiErrorMapping() {
  const mapped = mapOpenAiError(new Error("Model does not support file inputs"), "responses_api_failed");
  assert.equal(mapped.code, "unsupported_model");
  assert.ok(mapped instanceof ItiOpenAiError);
}

testPdfProcessingModeDefault();
testModelSupportsFileInputs();
testOpenAiFileSizeValidation();
testOpenAiBatchSizeValidation();
testResponsesRequestShapeForPdf();
testResponsesRequestShapeForImage();
testConsolidationPrefersAmendmentClosingDate();
testOpenAiErrorMapping();

console.log("ITI OpenAI validation checks passed.");
