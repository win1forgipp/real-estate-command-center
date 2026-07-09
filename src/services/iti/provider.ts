import "server-only";

import type { ItiExtractionInput, ItiProviderResult } from "@/services/iti/types";

export type ItiProvider = {
  name: string;
  isConfigured: boolean;
  extract(input: ItiExtractionInput): Promise<ItiProviderResult>;
};

export function getItiProviderName() {
  const provider =
    process.env.ITI_PROVIDER?.trim().toLowerCase() ??
    process.env.AI_EXTRACTION_PROVIDER?.trim().toLowerCase();

  if (provider === "mock") {
    return "mock";
  }

  if (process.env.OPENAI_API_KEY?.trim()) {
    return "openai";
  }

  return "mock";
}

export function isItiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getItiSetupMessage() {
  if (isItiConfigured()) {
    return undefined;
  }

  return "OPENAI_API_KEY is not configured. ITI will use mock extraction until you add your API key to .env and Vercel.";
}

export async function getItiProvider(): Promise<ItiProvider> {
  if (getItiProviderName() === "openai") {
    const { openAiItiProvider } = await import("@/services/iti/openai-provider");
    return openAiItiProvider;
  }

  const { mockItiProvider } = await import("@/services/iti/mock-provider");
  return mockItiProvider;
}

export async function runItiExtraction(
  input: ItiExtractionInput,
): Promise<ItiProviderResult> {
  const provider = await getItiProvider();
  return provider.extract(input);
}
