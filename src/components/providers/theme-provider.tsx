"use client";

type ThemeProviderProps = {
  children: React.ReactNode;
};

/**
 * Theme provider scaffold for future light/dark mode support.
 * Toggle the `dark` class on `<html>` when theme switching is implemented.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return children;
}
