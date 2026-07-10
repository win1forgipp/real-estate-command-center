import { ShieldAlert } from "lucide-react";

import { typography } from "@/lib/design-system/typography";
import { cn } from "@/lib/utils";

type AccessRestrictedProps = {
  title?: string;
  description?: string;
};

export function AccessRestricted({
  title = "Access Restricted",
  description = "Your current preview role does not have permission to view this page.",
}: AccessRestrictedProps) {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center rounded-2xl border border-dashed border-border/80 bg-card px-6 py-12 text-center shadow-sm md:px-10">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-foreground">
        <ShieldAlert className="size-8" aria-hidden="true" />
      </div>
      <h3 className={cn(typography.sectionTitle, "mt-6")}>{title}</h3>
      <p className={cn(typography.bodyMuted, "mt-3 max-w-xl")}>{description}</p>
    </section>
  );
}
