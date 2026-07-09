import { MapPin } from "lucide-react";

import { typography } from "@/lib/design-system/typography";
import { cn } from "@/lib/utils";

type PropertyAddressProps = {
  street: string;
  city: string;
  state: string;
  zip: string;
  showIcon?: boolean;
  className?: string;
};

export function PropertyAddress({
  street,
  city,
  state,
  zip,
  showIcon = true,
  className,
}: PropertyAddressProps) {
  return (
    <div className={cn("flex items-start gap-2", className)}>
      {showIcon ? (
        <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      ) : null}
      <div>
        <p className={typography.label}>{street}</p>
        <p className={typography.caption}>
          {city}, {state} {zip}
        </p>
      </div>
    </div>
  );
}
