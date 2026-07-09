"use client";

import { Input } from "@/components/ui/input";
import { FormField } from "@/components/design-system/forms/form-field";
import { cn } from "@/lib/utils";

type PhoneInputProps = {
  label: string;
  description?: string;
  error?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  id?: string;
  name?: string;
};

export function PhoneInput({
  label,
  description,
  error,
  value,
  onChange,
  id,
  name,
}: PhoneInputProps) {
  const fieldId = id ?? name;

  return (
    <FormField
      label={label}
      htmlFor={fieldId}
      description={description}
      error={error}
    >
      <Input
        id={fieldId}
        name={name}
        type="tel"
        value={value}
        onChange={onChange}
        className={cn("min-h-11")}
        placeholder="(555) 555-5555"
      />
    </FormField>
  );
}
