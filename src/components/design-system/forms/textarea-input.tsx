import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/design-system/forms/form-field";
import { cn } from "@/lib/utils";

type TextareaInputProps = React.ComponentProps<typeof Textarea> & {
  label: string;
  description?: string;
  error?: string;
};

export function TextareaInput({
  label,
  description,
  error,
  className,
  id,
  ...props
}: TextareaInputProps) {
  const fieldId = id ?? props.name;

  return (
    <FormField
      label={label}
      htmlFor={fieldId}
      description={description}
      error={error}
    >
      <Textarea id={fieldId} className={cn("min-h-28", className)} {...props} />
    </FormField>
  );
}
