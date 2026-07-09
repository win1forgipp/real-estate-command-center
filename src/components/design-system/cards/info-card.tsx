import { typography } from "@/lib/design-system/typography";
import { cn } from "@/lib/utils";

type InfoCardProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
};

export function InfoCard({
  title,
  description,
  children,
  className,
}: InfoCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-5 shadow-sm md:p-6",
        className,
      )}
    >
      <h3 className={typography.sectionTitle}>{title}</h3>
      <p className={cn(typography.bodyMuted, "mt-2")}>{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
