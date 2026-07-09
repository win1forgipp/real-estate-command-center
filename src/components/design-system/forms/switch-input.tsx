"use client";

import { Switch } from "@/components/ui/switch";
import { FormField } from "@/components/design-system/forms/form-field";
import { typography } from "@/lib/design-system/typography";
import { cn } from "@/lib/utils";

type SwitchInputProps = {
  label: string;
  description?: string;
  error?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  id?: string;
};

export function SwitchInput({
  label,
  description,
  error,
  checked,
  onCheckedChange,
  id,
}: SwitchInputProps) {
  return (
    <FormField label="" error={error}>
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-card px-4 py-3">
        <div>
          <label htmlFor={id} className={cn(typography.label, "cursor-pointer")}>
            {label}
          </label>
          {description ? (
            <p className={cn(typography.caption, "mt-1")}>{description}</p>
          ) : null}
        </div>
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange?.(Boolean(value))}
        />
      </div>
    </FormField>
  );
}
