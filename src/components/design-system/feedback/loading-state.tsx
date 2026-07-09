import { Loader2 } from "lucide-react";

import { typography } from "@/lib/design-system/typography";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  title?: string;
  description?: string;
  className?: string;
};

export function LoadingState({
  title = "Loading",
  description = "Please wait while we load this section.",
  className,
}: LoadingStateProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-card px-6 py-16 text-center shadow-sm",
        className,
      )}
    >
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
      <h3 className={cn(typography.sectionTitle, "mt-4")}>{title}</h3>
      <p className={cn(typography.bodyMuted, "mt-2 max-w-md")}>{description}</p>
    </section>
  );
}
