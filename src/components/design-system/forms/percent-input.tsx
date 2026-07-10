"use client";

import { useId } from "react";

import { FormField } from "@/components/design-system/forms/form-field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PercentInputProps = {
  label: string;
  description?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function PercentInput({
  label,
  description,
  error,
  value = "",
  onChange,
  placeholder = "0",
  className,
}: PercentInputProps) {
  const inputId = useId();

  return (
    <FormField label={label} description={description} error={error} htmlFor={inputId}>
      <div className="relative">
        <Input
          id={inputId}
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          className={cn("min-h-11 pr-8", className)}
          onChange={(event) => onChange?.(event.target.value)}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
          %
        </span>
      </div>
    </FormField>
  );
}
