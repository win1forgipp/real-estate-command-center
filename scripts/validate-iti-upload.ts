import assert from "node:assert/strict";

import { buildItiBlobPathname } from "../src/services/iti/blob-paths";
import { ITI_BLOB_TEMP_PREFIX, ITI_MAX_FILE_SIZE_BYTES, ITI_MAX_TOTAL_SIZE_BYTES } from "../src/services/iti/constants";
import {
  isItiSupportedFile,
  partitionItiFiles,
  validateItiSelection,
} from "../src/services/iti/upload-validation";

function validateBlobPathname(pathname: string, importSessionId: string) {
  const expectedPrefix = `${ITI_BLOB_TEMP_PREFIX}/${importSessionId}/`;
  return pathname.startsWith(expectedPrefix) && !pathname.includes("..");
}

function isAllowedBlobHostname(hostname: string) {
  const normalized = hostname.toLowerCase();
  return (
    normalized.endsWith(".public.blob.vercel-storage.com") ||
    normalized.endsWith(".blob.vercel-storage.com")
  );
}

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
}

function testEmptyFile() {
  const result = isItiSupportedFile(makeFile("empty.pdf", "application/pdf", 0));
  assert.equal(result.ok, false);
}

function testFileTooLarge() {
  const result = isItiSupportedFile(
    makeFile("large.pdf", "application/pdf", ITI_MAX_FILE_SIZE_BYTES + 1),
  );
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

function testDuplicateSelection() {
  const existing = [makeFile("a.pdf", "application/pdf")];
  const { supported, errors } = validateItiSelection(
    [makeFile("a.pdf", "application/pdf")],
    existing,
  );

  assert.equal(supported.length, 0);
  assert.equal(errors.length, 1);
}

function testTotalSizeLimit() {
  const existing = [makeFile("a.pdf", "application/pdf", ITI_MAX_TOTAL_SIZE_BYTES - 1000)];
  const { supported, errors } = validateItiSelection(
    [makeFile("b.pdf", "application/pdf", 2000)],
    existing,
  );

  assert.equal(supported.length, 0);
  assert.equal(errors.length, 1);
}

function testBlobPathname() {
  const pathname = buildItiBlobPathname("session-1", "Purchase Agreement.pdf");
  assert.match(pathname, /^iti\/temporary\/session-1\//);

  const validation = validateBlobPathname(pathname, "session-1");
  assert.equal(validation, true);
}

function testBlobUrlValidation() {
  const allowedHost = "example.public.blob.vercel-storage.com";
  assert.equal(isAllowedBlobHostname(allowedHost), true);

  const blockedHost = "evil.example.com";
  assert.equal(isAllowedBlobHostname(blockedHost), false);
}

function testExtractRequestShape() {
  const request = {
    importSessionId: "session-1",
    files: [
      {
        name: "Purchase Agreement.pdf",
        url: "https://example.public.blob.vercel-storage.com/iti/temporary/session-1/file.pdf",
        pathname: "iti/temporary/session-1/file.pdf",
        mimeType: "application/pdf",
        size: 5_000_000,
      },
    ],
  };

  assert.equal(typeof request.importSessionId, "string");
  assert.equal(request.files[0]?.size, 5_000_000);
}

testSupportedPdf();
testSupportedImage();
testUnsupportedDocx();
testEmptyFile();
testFileTooLarge();
testMultiplePdfPartition();
testDuplicateSelection();
testTotalSizeLimit();
testBlobPathname();
testBlobUrlValidation();
testExtractRequestShape();

console.log("ITI upload validation checks passed.");
