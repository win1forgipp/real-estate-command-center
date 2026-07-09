import { cn } from "@/lib/utils";

export const iconSizes = {
  xs: "size-3",
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
  xl: "size-8",
} as const;

type IconProps = {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  size?: keyof typeof iconSizes;
  className?: string;
  label?: string;
};

export function Icon({ icon: IconComponent, size = "md", className, label }: IconProps) {
  return (
    <IconComponent
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={cn("shrink-0", iconSizes[size], className)}
    />
  );
}
