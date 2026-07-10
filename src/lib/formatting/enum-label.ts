const PRESERVED_ACRONYMS = new Set([
  "MLS",
  "EMD",
  "HOA",
  "VA",
  "FHA",
  "ITI",
  "RVAR",
  "MKB",
]);

const PRESERVED_PHRASES: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\bexp\b/gi, replacement: "eXp" },
  { pattern: /\brealtors\b/gi, replacement: "REALTORS®" },
];

function capitalizeWord(word: string): string {
  if (!word) {
    return word;
  }

  const upper = word.toUpperCase();
  if (PRESERVED_ACRONYMS.has(upper)) {
    return upper;
  }

  if (/^mc[a-z]/i.test(word)) {
    return `Mc${word.slice(2, 3).toUpperCase()}${word.slice(3)}`;
  }

  if (/^mac[a-z]/i.test(word)) {
    return `Mac${word.slice(3, 4).toUpperCase()}${word.slice(4)}`;
  }

  if (/^o['’][a-z]/i.test(word)) {
    return `O'${word.slice(2, 3).toUpperCase()}${word.slice(3)}`;
  }

  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function formatEnumLabel(value: string | null | undefined): string {
  if (!value?.trim()) {
    return "";
  }

  const normalized = value.trim().replace(/[-/]+/g, " ");
  const segments = normalized.split(/\s+/).filter(Boolean);

  let formatted = segments
    .map((segment) =>
      segment
        .split("_")
        .map((part) => capitalizeWord(part))
        .join(" "),
    )
    .join(" ");

  for (const { pattern, replacement } of PRESERVED_PHRASES) {
    formatted = formatted.replace(pattern, replacement);
  }

  return formatted;
}
