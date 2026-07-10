"use client";

import { useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/design-system/forms/form-field";
import {
  getOptionLabel,
  type SelectOption,
} from "@/lib/formatting/option-label";
import { formatEnumLabel } from "@/lib/formatting/enum-label";

export type DropdownOption = SelectOption;

type DropdownInputProps = {
  label: string;
  description?: string;
  error?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: DropdownOption[];
};

export function DropdownInput({
  label,
  description,
  error,
  placeholder = "Select an option",
  value,
  onValueChange,
  options,
}: DropdownInputProps) {
  const selectedLabel = useMemo(() => {
    const labelFromOptions = getOptionLabel(value, options);
    if (labelFromOptions) {
      return labelFromOptions;
    }

    return value ? formatEnumLabel(value) : undefined;
  }, [options, value]);

  return (
    <FormField label={label} description={description} error={error}>
      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue != null) {
            onValueChange?.(nextValue);
          }
        }}
      >
        <SelectTrigger className="min-h-11 w-full">
          <SelectValue placeholder={placeholder}>
            {selectedLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
