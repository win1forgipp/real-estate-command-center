"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/design-system/forms/form-field";
import { typography } from "@/lib/design-system/typography";
import { cn } from "@/lib/utils";

type CheckboxInputProps = {
  label: string;
  description?: string;
  error?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  id?: string;
};

export function CheckboxInput({
  label,
  description,
  error,
  checked,
  onCheckedChange,
  id,
}: CheckboxInputProps) {
  return (
    <FormField label="" error={error}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange?.(Boolean(value))}
        />
        <div>
          <label htmlFor={id} className={cn(typography.label, "cursor-pointer")}>
            {label}
          </label>
          {description ? (
            <p className={cn(typography.caption, "mt-1")}>{description}</p>
          ) : null}
        </div>
      </div>
    </FormField>
  );
}
