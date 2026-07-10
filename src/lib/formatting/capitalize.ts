import { formatEnumLabel } from "@/lib/formatting/enum-label";

const LOWERCASE_PARTICLES = new Set(["de", "la", "del", "van", "von"]);

export function capitalizeNameSegment(segment: string): string {
  const trimmed = segment.trim();
  if (!trimmed) {
    return "";
  }

  if (LOWERCASE_PARTICLES.has(trimmed.toLowerCase())) {
    return trimmed.toLowerCase();
  }

  return formatEnumLabel(trimmed);
}

export function capitalizePersonName(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((segment) => capitalizeNameSegment(segment))
    .join(" ");
}

export function formatDisplayName(
  value: string | null | undefined,
  { asPersonName = false }: { asPersonName?: boolean } = {},
): string {
  if (!value?.trim()) {
    return "";
  }

  return asPersonName ? capitalizePersonName(value) : formatEnumLabel(value);
}
