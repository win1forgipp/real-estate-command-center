import "server-only";

import { detectItiDocumentType } from "@/services/iti/document-type";
import type { ItiDocumentType } from "@/services/iti/types";

export { detectItiDocumentType };
export type { ItiDocumentType };

function getDocumentTextChunk(documentText: string, fileName: string) {
  const marker = `--- ${fileName} ---`;
  if (!documentText.includes(marker)) {
    return "";
  }

  return documentText.split(marker)[1]?.split("\n--- ")[0]?.trim() ?? "";
}

export { getDocumentTextChunk };
