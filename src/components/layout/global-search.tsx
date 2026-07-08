"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { mockSearchResults } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type GlobalSearchProps = {
  className?: string;
};

export function GlobalSearch({ className }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return [];
    }

    return mockSearchResults.filter(
      (result) =>
        result.label.toLowerCase().includes(normalized) ||
        result.detail.toLowerCase().includes(normalized) ||
        result.category.toLowerCase().includes(normalized),
    );
  }, [query]);

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          window.setTimeout(() => setFocused(false), 150);
        }}
        placeholder="Search contacts, deals, properties..."
        aria-label="Global search"
        className="h-11 min-h-11 pl-9"
      />

      {focused && query.trim() ? (
        <div className="absolute top-[calc(100%+0.5rem)] z-50 w-full rounded-xl border border-border/70 bg-popover p-2 shadow-lg">
          {results.length ? (
            <ul className="space-y-1">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    className="flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {result.label}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {result.category} · {result.detail}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No mock results found. Search will connect to live data later.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
