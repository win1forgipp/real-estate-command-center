"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useCommandPalette } from "@/components/command-palette/command-palette-provider";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { notify } from "@/components/design-system/notifications/toast";
import { notifyComingSoon } from "@/lib/create-actions";
import { getCommandPaletteItems } from "@/lib/command-palette/registry";
import {
  commandPaletteGroups,
  type CommandPaletteItem,
} from "@/lib/command-palette/types";

type CommandPaletteProps = {
  itemMap: Map<string, CommandPaletteItem>;
};

function getSearchValue(item: CommandPaletteItem) {
  return [item.label, item.description, ...(item.keywords ?? [])]
    .filter(Boolean)
    .join(" ");
}

export function CommandPalette({ itemMap }: CommandPaletteProps) {
  const router = useRouter();
  const { open, setOpen, recentItems, runCommand } = useCommandPalette();
  const items = getCommandPaletteItems();

  const handleSelect = useCallback(
    (item: CommandPaletteItem) => {
      runCommand(item);

      if (item.href) {
        router.push(item.href);

        if (item.group === "workspaces") {
          notify.info(
            "Workspace view coming soon",
            `${item.label} will open in its dedicated workspace.`,
          );
        } else if (item.group === "actions") {
          notifyComingSoon(item.label);
        }
      }
    },
    [router, runCommand],
  );

  const groupedItems = commandPaletteGroups
    .map((group) => ({
      ...group,
      items:
        group.id === "recent"
          ? recentItems
          : items.filter((item) => item.group === group.id),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Universal Command Palette"
      description="Search navigation, actions, and workspaces"
      className="sm:max-w-xl"
    >
      <CommandInput placeholder="Search modules, actions, and records..." />
      <CommandList>
        <CommandEmpty>No matching commands found.</CommandEmpty>
        {groupedItems.map((group, index) => (
          <div key={group.id}>
            {index > 0 ? <CommandSeparator /> : null}
            <CommandGroup heading={group.label}>
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <CommandItem
                    key={item.id}
                    value={getSearchValue(item)}
                    disabled={item.disabled}
                    onSelect={() => {
                      const resolved = itemMap.get(item.id) ?? item;
                      handleSelect(resolved);
                    }}
                  >
                    {Icon ? <Icon aria-hidden="true" /> : null}
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">{item.label}</span>
                      {item.description ? (
                        <span className="truncate text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      ) : null}
                    </div>
                    {group.id === "navigation" ? (
                      <CommandShortcut>Go</CommandShortcut>
                    ) : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
