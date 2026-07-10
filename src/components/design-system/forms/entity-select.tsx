"use client";

import { DropdownInput, type DropdownOption } from "@/components/design-system/forms/dropdown-input";

type EnumSelectProps = {
  label: string;
  description?: string;
  error?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: readonly DropdownOption[];
};

export function EnumSelect(props: EnumSelectProps) {
  return <DropdownInput {...props} options={[...props.options]} />;
}

type EntitySelectProps = EnumSelectProps;

export function EntitySelect(props: EntitySelectProps) {
  return <EnumSelect {...props} />;
}

export function UserSelect(props: EntitySelectProps) {
  return <EntitySelect {...props} placeholder={props.placeholder ?? "Select a user"} />;
}

export function TransactionSelect(props: EntitySelectProps) {
  return <EntitySelect {...props} placeholder={props.placeholder ?? "Select a transaction"} />;
}
