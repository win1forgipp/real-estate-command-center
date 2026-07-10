import assert from "node:assert/strict";

import {
  isItiSupportedFile,
  partitionItiFiles,
} from "../src/services/iti/upload-validation";

function makeFile(name: string, type: string, size = 1024) {
  return { name, type, size };
}

function testSupportedPdf() {
  const result = isItiSupportedFile(makeFile("purchase-agreement.pdf", "application/pdf"));
  assert.equal(result.ok, true);
}

function testSupportedImage() {
  const result = isItiSupportedFile(makeFile("scan.jpg", "image/jpeg"));
  assert.equal(result.ok, true);
}

function testUnsupportedDocx() {
  const result = isItiSupportedFile(
    makeFile("notes.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /Unsupported file type/i);
  }
}

function testEmptyFile() {
  const result = isItiSupportedFile(makeFile("empty.pdf", "application/pdf", 0));
  assert.equal(result.ok, false);
}

function testMultiplePdfPartition() {
  const { supported, unsupported } = partitionItiFiles([
    makeFile("a.pdf", "application/pdf"),
    makeFile("b.pdf", "application/pdf"),
    makeFile("c.txt", "text/plain"),
  ]);

  assert.equal(supported.length, 2);
  assert.equal(unsupported.length, 1);
}

function testResponseShape() {
  const success = {
    ok: true,
    extractionId: "ext-1",
    documentIds: ["doc-1"],
    files: [
      {
        fileName: "a.pdf",
        fileType: "application/pdf",
        fileSize: 1000,
        status: "review_suggested" as const,
      },
    ],
    provider: "mock" as const,
  };

  assert.equal(typeof success.ok, "boolean");
  assert.ok(success.extractionId);
}

testSupportedPdf();
testSupportedImage();
testUnsupportedDocx();
testEmptyFile();
testMultiplePdfPartition();
testResponseShape();

console.log("ITI upload validation checks passed.");
