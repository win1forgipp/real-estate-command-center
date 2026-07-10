import {
  MIN_ALPHA_RATIO,
  MIN_USABLE_TEXT_CHARS,
  MIN_USABLE_WORD_COUNT,
} from "@/services/iti/document-processing/constants";

export type TextQualityAssessment = {
  isUsable: boolean;
  reason?: string;
  score: number;
};

const PLACEHOLDER_PATTERNS = [
  /ocr not enabled/i,
  /\[image uploaded/i,
  /scanned document analysis \(mock\)/i,
];

export function assessTextQuality(text: string): TextQualityAssessment {
  const trimmed = text.trim();

  if (!trimmed) {
    return { isUsable: false, reason: "empty", score: 0 };
  }

  if (PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return { isUsable: false, reason: "placeholder", score: 0 };
  }

  if (trimmed.length < MIN_USABLE_TEXT_CHARS) {
    return { isUsable: false, reason: "too_short", score: trimmed.length };
  }

  const words = trimmed.match(/\b[a-zA-Z]{2,}\b/g) ?? [];
  if (words.length < MIN_USABLE_WORD_COUNT) {
    return { isUsable: false, reason: "few_words", score: words.length };
  }

  const alphaCount = trimmed.match(/[a-zA-Z]/g)?.length ?? 0;
  const alphaRatio = alphaCount / trimmed.length;
  if (alphaRatio < MIN_ALPHA_RATIO) {
    return { isUsable: false, reason: "low_alpha", score: alphaRatio };
  }

  const whitespaceRatio = (trimmed.match(/\s/g)?.length ?? 0) / trimmed.length;
  if (whitespaceRatio > 0.75) {
    return { isUsable: false, reason: "mostly_whitespace", score: whitespaceRatio };
  }

  return { isUsable: true, score: trimmed.length };
}
