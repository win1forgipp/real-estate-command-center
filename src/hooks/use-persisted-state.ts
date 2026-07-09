"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "rec-app-state";
const EMPTY_RECORD: Record<string, boolean> = {};

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(`${STORAGE_PREFIX}:${key}`);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(`${STORAGE_PREFIX}:${key}`, JSON.stringify(value));
}

export function usePersistedRecord(key: string) {
  const [value, setValue] = useState<Record<string, boolean>>(EMPTY_RECORD);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(readStorage(key, EMPTY_RECORD));
    setHydrated(true);
  }, [key]);

  const setRecord = useCallback(
    (updater: (current: Record<string, boolean>) => Record<string, boolean>) => {
      setValue((current) => {
        const next = updater(current);
        writeStorage(key, next);
        return next;
      });
    },
    [key],
  );

  return { value, setRecord, hydrated };
}

export function usePersistedBoolean(key: string, initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(readStorage(key, initialValue));
    setHydrated(true);
  }, [key, initialValue]);

  const setPersistedValue = useCallback(
    (nextValue: boolean) => {
      setValue(nextValue);
      writeStorage(key, nextValue);
    },
    [key],
  );

  return { value, setValue: setPersistedValue, hydrated };
}
