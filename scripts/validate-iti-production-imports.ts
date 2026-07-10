import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(process.cwd(), "src");
const BANNED_PATTERNS = [
  /from ["']pdf-parse["']/,
  /from ["']pdfjs-dist["']/,
  /from ["']@napi-rs\/canvas["']/,
  /import\(["']pdf-parse["']\)/,
  /import\(["']pdfjs-dist["']\)/,
  /render-pdf-pages/,
  /extract-pdf-text/,
  /extract-with-vision/,
  /document-processing\//,
];

const PRODUCTION_PATHS = [
  "services/iti/extract-service.ts",
  "services/iti/document-parser.ts",
  "services/iti/document-type.ts",
  "services/iti/openai",
  "app/api/iti/extract/route.ts",
  "features/transactions/components/new-transaction-wizard/iti-upload-panel.tsx",
  "features/transactions/components/new-transaction-wizard/new-transaction-wizard.tsx",
  "features/transactions/lib/iti-blob-upload.ts",
];

function collectFiles(targetPath: string, files: string[] = []) {
  const absolute = join(ROOT, targetPath);
  const stats = statSync(absolute);

  if (stats.isFile()) {
    if (absolute.endsWith(".ts") || absolute.endsWith(".tsx")) {
      files.push(absolute);
    }
    return files;
  }

  for (const entry of readdirSync(absolute)) {
    collectFiles(join(targetPath, entry), files);
  }

  return files;
}

const violations: string[] = [];

for (const productionPath of PRODUCTION_PATHS) {
  for (const filePath of collectFiles(productionPath)) {
    const content = readFileSync(filePath, "utf8");
    for (const pattern of BANNED_PATTERNS) {
      if (pattern.test(content)) {
        violations.push(`${relative(process.cwd(), filePath)} matched ${pattern}`);
      }
    }
  }
}

if (violations.length) {
  console.error("Production ITI import graph violations:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("Production ITI import graph checks passed.");
