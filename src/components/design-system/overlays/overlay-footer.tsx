import { cn } from "@/lib/utils";

export const overlayFooterClassName =
  "flex shrink-0 flex-col-reverse gap-2 border-t border-border/70 bg-muted/30 px-5 py-4 pb-5 sm:flex-row sm:justify-end";

export function OverlayFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn(overlayFooterClassName, className)} {...props} />;
}
