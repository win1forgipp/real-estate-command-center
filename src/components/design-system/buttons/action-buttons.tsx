"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const actionButtonClassName = "min-h-11";

type ActionButtonProps = React.ComponentProps<typeof Button>;

export function PrimaryButton({ className, size = "lg", ...props }: ActionButtonProps) {
  return (
    <Button
      variant="default"
      size={size}
      className={cn(actionButtonClassName, className)}
      {...props}
    />
  );
}

export function SecondaryButton({ className, size = "lg", ...props }: ActionButtonProps) {
  return (
    <Button
      variant="outline"
      size={size}
      className={cn(actionButtonClassName, className)}
      {...props}
    />
  );
}

export function DestructiveButton({
  className,
  size = "lg",
  ...props
}: ActionButtonProps) {
  return (
    <Button
      variant="destructive"
      size={size}
      className={cn(actionButtonClassName, className)}
      {...props}
    />
  );
}
