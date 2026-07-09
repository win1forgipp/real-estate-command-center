"use client";

import { AppActionFormsProvider } from "@/features/app-action-forms/provider";
import { CommandPaletteProvider } from "@/components/command-palette";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToasterProvider } from "@/components/design-system/notifications/toaster-provider";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <CommandPaletteProvider>
          <AppActionFormsProvider>
            {children}
            <ToasterProvider />
          </AppActionFormsProvider>
        </CommandPaletteProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
