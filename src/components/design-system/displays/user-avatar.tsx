import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name: string;
  initials?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
};

export function UserAvatar({
  name,
  initials,
  size = "md",
  className,
}: UserAvatarProps) {
  const label = initials ?? name.slice(0, 1).toUpperCase();

  return (
    <span
      aria-label={name}
      title={name}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground",
        sizeClasses[size],
        className,
      )}
    >
      {label}
    </span>
  );
}
