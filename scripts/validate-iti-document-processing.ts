import assert from "node:assert/strict";

import { assessTextQuality } from "../src/services/iti/document-processing/assess-text-quality";

function testEmptyText() {
  const result = assessTextQuality("");
  assert.equal(result.isUsable, false);
  assert.equal(result.reason, "empty");
}

function testPlaceholderText() {
  const result = assessTextQuality("[Image uploaded. OCR not enabled in ITI v1.]");
  assert.equal(result.isUsable, false);
  assert.equal(result.reason, "placeholder");
}

function testShortText() {
  const result = assessTextQuality("abc");
  assert.equal(result.isUsable, false);
  assert.equal(result.reason, "too_short");
}

function testUsableContractText() {
  const result = assessTextQuality(
    [
      "Residential Purchase Agreement",
      "Property Address: 142 Oak Lane, Richmond, VA 23220",
      "Purchase Price: $425,000",
      "Contract Date: March 15, 2026",
      "Closing Date: May 1, 2026",
      "Buyer: Alex Morgan",
      "Seller: Taylor Brooks",
      "Earnest Money: $5,000",
    ].join("\n"),
  );

  assert.equal(result.isUsable, true);
}

testEmptyText();
testPlaceholderText();
testShortText();
testUsableContractText();

console.log("ITI document processing validation checks passed.");
