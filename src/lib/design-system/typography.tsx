import { cn } from "@/lib/utils";

export const typography = {
  pageTitle: "text-2xl font-semibold tracking-tight text-foreground md:text-3xl",
  sectionTitle: "text-xl font-semibold text-foreground",
  cardTitle: "text-base font-semibold text-foreground",
  body: "text-base leading-7 text-foreground",
  bodyMuted: "text-base leading-7 text-muted-foreground",
  label: "text-sm font-medium text-foreground",
  caption: "text-xs text-muted-foreground",
  eyebrow: "text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground",
} as const;

type TypographyProps = {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
};

export function PageTitle({ as = "h1", className, children }: TypographyProps) {
  const Tag = as;
  return <Tag className={cn(typography.pageTitle, className)}>{children}</Tag>;
}

export function SectionTitle({ as = "h2", className, children }: TypographyProps) {
  const Tag = as;
  return (
    <Tag className={cn(typography.sectionTitle, className)}>{children}</Tag>
  );
}

export function CardTitleText({ as = "h3", className, children }: TypographyProps) {
  const Tag = as;
  return <Tag className={cn(typography.cardTitle, className)}>{children}</Tag>;
}

export function BodyText({ as = "p", className, children }: TypographyProps) {
  const Tag = as;
  return <Tag className={cn(typography.body, className)}>{children}</Tag>;
}

export function MutedText({ as = "p", className, children }: TypographyProps) {
  const Tag = as;
  return <Tag className={cn(typography.bodyMuted, className)}>{children}</Tag>;
}
