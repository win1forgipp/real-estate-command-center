import { Input } from "@/components/ui/input";
import { FormField } from "@/components/design-system/forms/form-field";
import { cn } from "@/lib/utils";

type TextInputProps = React.ComponentProps<typeof Input> & {
  label: string;
  description?: string;
  error?: string;
};

export function TextInput({
  label,
  description,
  error,
  className,
  id,
  ...props
}: TextInputProps) {
  const fieldId = id ?? props.name;

  return (
    <FormField
      label={label}
      htmlFor={fieldId}
      description={description}
      error={error}
    >
      <Input id={fieldId} className={cn("min-h-11", className)} {...props} />
    </FormField>
  );
}
