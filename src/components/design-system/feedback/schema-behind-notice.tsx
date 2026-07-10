import { Database } from "lucide-react";

import { typography } from "@/lib/design-system/typography";
import { cn } from "@/lib/utils";

type SchemaBehindNoticeProps = {
  message: string;
  className?: string;
};

export function SchemaBehindNotice({
  message,
  className,
}: SchemaBehindNoticeProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-amber-300/80 bg-amber-50 px-6 py-8 text-center shadow-sm dark:border-amber-500/40 dark:bg-amber-950/30",
        className,
      )}
    >
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100">
        <Database className="size-7" aria-hidden="true" />
      </div>
      <h2 className={cn(typography.sectionTitle, "mt-5")}>
        Database update required
      </h2>
      <p className={cn(typography.bodyMuted, "mx-auto mt-3 max-w-2xl")}>
        {message}
      </p>
      <p className={cn(typography.caption, "mx-auto mt-4 max-w-xl")}>
        Run <code className="font-mono">npm run db:migrate</code> against
        production Turso before using transaction routes.
      </p>
    </section>
  );
}
