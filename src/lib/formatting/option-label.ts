export type SelectOption = {
  label: string;
  value: string;
};

export function getOptionLabel(
  value: string | undefined | null,
  options: readonly SelectOption[],
): string | undefined {
  if (!value) {
    return undefined;
  }

  return options.find((option) => option.value === value)?.label;
}

export function toSelectOptions<T extends string>(
  entries: readonly { label: string; value: T }[],
): SelectOption[] {
  return entries.map((entry) => ({ label: entry.label, value: entry.value }));
}
