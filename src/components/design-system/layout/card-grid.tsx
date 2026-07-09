import { layout } from "@/lib/design-system/spacing";
import { cn } from "@/lib/utils";

type CardGridProps = {
  children: React.ReactNode;
  className?: string;
  columns?: "default" | "two" | "three";
};

const columnClasses = {
  default: layout.cardGrid,
  two: "grid grid-cols-1 gap-4 md:grid-cols-2",
  three: "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3",
};

export function CardGrid({
  children,
  className,
  columns = "default",
}: CardGridProps) {
  return (
    <div className={cn(columnClasses[columns], className)}>{children}</div>
  );
}
