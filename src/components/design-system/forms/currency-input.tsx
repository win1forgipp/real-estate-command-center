"use client";

import { Input } from "@/components/ui/input";
import { FormField } from "@/components/design-system/forms/form-field";
import { cn } from "@/lib/utils";

type CurrencyInputProps = {
  label: string;
  description?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  id?: string;
  name?: string;
};

export function CurrencyInput({
  label,
  description,
  error,
  value,
  onChange,
  id,
  name,
}: CurrencyInputProps) {
  const fieldId = id ?? name;

  return (
    <FormField
      label={label}
      htmlFor={fieldId}
      description={description}
      error={error}
    >
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
          $
        </span>
        <Input
          id={fieldId}
          name={name}
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className={cn("min-h-11 pl-7")}
          placeholder="0"
        />
      </div>
    </FormField>
  );
}
