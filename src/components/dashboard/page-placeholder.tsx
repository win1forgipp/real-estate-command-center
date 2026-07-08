type PagePlaceholderProps = {
  title: string;
  description: string;
};

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-border/70 bg-card p-6 shadow-sm md:p-8">
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      <p className="mt-3 text-base leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
