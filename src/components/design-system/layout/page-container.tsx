import { layout, spacing } from "@/lib/design-system/spacing";
import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn(layout.pageMaxWidth, spacing.section, className)}>
      {children}
    </div>
  );
}
