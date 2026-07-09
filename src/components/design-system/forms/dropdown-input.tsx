"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/design-system/forms/form-field";

type DropdownOption = {
  label: string;
  value: string;
};

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
          <SelectValue placeholder={placeholder} />
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
