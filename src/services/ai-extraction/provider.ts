import "server-only";

import type { ExtractionInput, ExtractionResult } from "@/services/ai-extraction/types";

export type ExtractionProvider = {
  name: string;
  isConfigured: boolean;
  setupMessage?: string;
  extract(input: ExtractionInput): Promise<ExtractionResult>;
};

export function getExtractionProviderName() {
  const provider = process.env.AI_EXTRACTION_PROVIDER?.trim().toLowerCase();

  if (provider === "mock") {
    return "mock";
  }

  if (process.env.OPENAI_API_KEY?.trim()) {
    return "openai";
  }

  return "mock";
}

export function isExtractionConfigured() {
  return getExtractionProviderName() !== "mock" || process.env.AI_EXTRACTION_PROVIDER === "mock";
}

export function getExtractionSetupMessage() {
  if (getExtractionProviderName() === "openai") {
    return undefined;
  }

  return "AI extraction is running in mock/dev mode. Add OPENAI_API_KEY to .env for live extraction.";
}

export async function getExtractionProvider(): Promise<ExtractionProvider> {
  const name = getExtractionProviderName();

  if (name === "openai") {
    const { openAiExtractionProvider } = await import(
      "@/services/ai-extraction/openai-extractor"
    );
    return openAiExtractionProvider;
  }

  const { mockExtractionProvider } = await import(
    "@/services/ai-extraction/mock-extractor"
  );
  return mockExtractionProvider;
}

export async function extractPurchaseAgreement(
  input: ExtractionInput,
): Promise<ExtractionResult> {
  const provider = await getExtractionProvider();
  return provider.extract(input);
}
