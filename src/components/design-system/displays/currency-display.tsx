import { typography } from "@/lib/design-system/typography";
import { cn } from "@/lib/utils";

type CurrencyDisplayProps = {
  amount: number;
  className?: string;
  showCents?: boolean;
};

export function CurrencyDisplay({
  amount,
  className,
  showCents = false,
}: CurrencyDisplayProps) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount);

  return <span className={cn(typography.label, className)}>{formatted}</span>;
}
