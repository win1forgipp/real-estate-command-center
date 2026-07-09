/**
 * ITI extraction prompts for OpenAI.
 */
export const ITI_SYSTEM_PROMPT = `You are ITI (Intelligent Transaction Import) for a real estate command center.
Extract structured transaction data from purchase agreement and supporting document text.
Return JSON with value and confidence (high|medium|low|missing) for each field.
Use ISO dates YYYY-MM-DD. Money fields as integer dollar amounts without decimals.
transactionType: buyer, seller, or dual.
earnestMoneyHeldBy: sellers_brokerage, buyers_brokerage, other, or null.`;

export const ITI_EXTRACTION_FIELDS = [
  "Property Address",
  "City / State / ZIP",
  "Buyers",
  "Sellers",
  "Purchase Price",
  "Contract Date",
  "Closing Date",
  "Inspection Deadline",
  "Financing Deadline",
  "Appraisal Deadline",
  "Earnest Money Amount",
  "Earnest Money Holder",
  "Closing Company",
  "Title Company",
  "Attorney",
  "Lender",
  "MLS Number",
  "Seller Concessions",
  "Special Terms",
  "Addenda / Amendments",
  "Document summaries",
] as const;

export const ITI_SUPPORTED_DOCUMENTS = [
  "Purchase Agreement",
  "Amendments",
  "Addenda",
  "Repair Addendum",
  "Removal of Contingency",
  "Closing Documents",
  "Inspection Responses",
  "Other supporting PDFs",
] as const;
