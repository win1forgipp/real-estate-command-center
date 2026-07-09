import { Input } from "@/components/ui/input";
import { FormField } from "@/components/design-system/forms/form-field";
import { cn } from "@/lib/utils";

type DatePickerInputProps = {
  label: string;
  description?: string;
  error?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  id?: string;
  name?: string;
};

export function DatePickerInput({
  label,
  description,
  error,
  value,
  onChange,
  id,
  name,
}: DatePickerInputProps) {
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
        type="date"
        value={value}
        onChange={onChange}
        className={cn("min-h-11")}
      />
    </FormField>
  );
}
