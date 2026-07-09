"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormField } from "@/components/design-system/forms/form-field";
import { cn } from "@/lib/utils";

type ComboboxOption = {
  label: string;
  value: string;
};

type ComboboxInputProps = {
  label: string;
  description?: string;
  error?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: ComboboxOption[];
};

export function ComboboxInput({
  label,
  description,
  error,
  placeholder = "Select an option",
  value,
  onValueChange,
  options,
}: ComboboxInputProps) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  return (
    <FormField label={label} description={description} error={error}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            buttonVariants({ variant: "outline" }),
            "min-h-11 w-full justify-between",
          )}
        >
          {selected?.label ?? placeholder}
          <ChevronsUpDown className="size-4 opacity-60" />
        </PopoverTrigger>
        <PopoverContent className="w-72 p-1">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-muted",
                value === option.value && "bg-muted",
              )}
              onClick={() => {
                onValueChange?.(option.value);
                setOpen(false);
              }}
            >
              {option.label}
              {value === option.value ? <Check className="size-4" /> : null}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </FormField>
  );
}
