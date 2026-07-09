"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { CommandPalette } from "@/components/command-palette/command-palette";
import { useCommandPaletteShortcut } from "@/hooks/use-command-palette-shortcut";
import { usePersistedState } from "@/hooks/use-persisted-state";
import {
  getCommandPaletteItemMap,
  getRecentCommandItems,
} from "@/lib/command-palette/registry";
import type { CommandPaletteItem } from "@/lib/command-palette/types";

const MAX_RECENT_ITEMS = 5;
const EMPTY_RECENT: string[] = [];

type CommandPaletteContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  recentItems: CommandPaletteItem[];
  runCommand: (item: CommandPaletteItem) => void;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null,
);

export function CommandPaletteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { value: recentIds, setValue: setRecentIds } = usePersistedState<string[]>(
    "command-palette-recent",
    EMPTY_RECENT,
  );

  const itemMap = useMemo(() => getCommandPaletteItemMap(), []);
  const recentItems = useMemo(
    () => getRecentCommandItems(recentIds),
    [recentIds],
  );

  const toggle = useCallback(() => {
    setOpen((current) => !current);
  }, []);

  const runCommand = useCallback(
    (item: CommandPaletteItem) => {
      setRecentIds((current) => {
        const next = [item.id, ...current.filter((id) => id !== item.id)];
        return next.slice(0, MAX_RECENT_ITEMS);
      });
      setOpen(false);
    },
    [setRecentIds],
  );

  useCommandPaletteShortcut({ onToggle: toggle });

  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggle,
      recentItems,
      runCommand,
    }),
    [open, recentItems, runCommand, toggle],
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette itemMap={itemMap} />
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);

  if (!context) {
    throw new Error(
      "useCommandPalette must be used within CommandPaletteProvider",
    );
  }

  return context;
}
