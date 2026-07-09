"use client";

import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { FormField } from "@/components/design-system/forms/form-field";
import { Label } from "@/components/ui/label";

type RadioOption = {
  label: string;
  value: string;
};

type RadioInputProps = {
  label: string;
  description?: string;
  error?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: RadioOption[];
};

export function RadioInput({
  label,
  description,
  error,
  value,
  onValueChange,
  options,
}: RadioInputProps) {
  return (
    <FormField label={label} description={description} error={error}>
      <RadioGroup value={value} onValueChange={onValueChange} className="gap-3">
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <RadioGroupItem value={option.value} id={option.value} />
            <Label htmlFor={option.value}>{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
    </FormField>
  );
}
