"use client";

import { Search } from "lucide-react";

import { useCommandPalette } from "@/components/command-palette/command-palette-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CommandPaletteTriggerProps = {
  className?: string;
};

export function CommandPaletteTrigger({ className }: CommandPaletteTriggerProps) {
  const { setOpen } = useCommandPalette();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "min-h-11 w-full justify-start gap-2 px-3 text-muted-foreground md:max-w-md",
        className,
      )}
      aria-label="Open command palette"
    >
      <Search className="size-4 shrink-0" aria-hidden="true" />
      <span className="flex-1 truncate text-left text-sm">
        Search modules, actions, and records...
      </span>
      <kbd className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
        ⌘K
      </kbd>
    </button>
  );
}
