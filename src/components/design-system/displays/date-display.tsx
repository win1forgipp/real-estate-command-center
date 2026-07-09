import { typography } from "@/lib/design-system/typography";
import { cn } from "@/lib/utils";

type DateDisplayProps = {
  value: Date | string | number;
  className?: string;
  variant?: "short" | "long";
};

export function DateDisplay({
  value,
  className,
  variant = "short",
}: DateDisplayProps) {
  const date = value instanceof Date ? value : new Date(value);

  const formatted = new Intl.DateTimeFormat("en-US", {
    month: variant === "long" ? "long" : "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

  return <time className={cn(typography.label, className)} dateTime={date.toISOString()}>{formatted}</time>;
}
