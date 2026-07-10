"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Permission } from "@/lib/permissions/permissions";
import {
  DEFAULT_PREVIEW_ROLE,
  isPreviewRole,
  PREVIEW_ROLE_LABELS,
  VIEW_AS_STORAGE_KEY,
  type PreviewRole,
} from "@/lib/permissions/roles";
import { roleCanEdit, roleHasPermission } from "@/lib/permissions/visibility";

type PermissionContextValue = {
  previewRole: PreviewRole;
  previewRoleLabel: string;
  isPreviewing: boolean;
  setPreviewRole: (role: PreviewRole) => void;
  resetPreviewRole: () => void;
  can: (permission: Permission) => boolean;
  canEdit: boolean;
};

const PermissionContext = createContext<PermissionContextValue | null>(null);

function readStoredPreviewRole(): PreviewRole {
  if (typeof window === "undefined") {
    return DEFAULT_PREVIEW_ROLE;
  }

  const stored = sessionStorage.getItem(VIEW_AS_STORAGE_KEY);
  return isPreviewRole(stored) ? stored : DEFAULT_PREVIEW_ROLE;
}

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const [previewRole, setPreviewRoleState] = useState<PreviewRole>(DEFAULT_PREVIEW_ROLE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPreviewRoleState(readStoredPreviewRole());
    setHydrated(true);
  }, []);

  const setPreviewRole = useCallback((role: PreviewRole) => {
    setPreviewRoleState(role);
    sessionStorage.setItem(VIEW_AS_STORAGE_KEY, role);
  }, []);

  const resetPreviewRole = useCallback(() => {
    setPreviewRole(DEFAULT_PREVIEW_ROLE);
  }, [setPreviewRole]);

  const value = useMemo<PermissionContextValue>(
    () => ({
      previewRole: hydrated ? previewRole : DEFAULT_PREVIEW_ROLE,
      previewRoleLabel: PREVIEW_ROLE_LABELS[hydrated ? previewRole : DEFAULT_PREVIEW_ROLE],
      isPreviewing: hydrated && previewRole !== DEFAULT_PREVIEW_ROLE,
      setPreviewRole,
      resetPreviewRole,
      can: (permission) => roleHasPermission(hydrated ? previewRole : DEFAULT_PREVIEW_ROLE, permission),
      canEdit: roleCanEdit(hydrated ? previewRole : DEFAULT_PREVIEW_ROLE),
    }),
    [hydrated, previewRole, resetPreviewRole, setPreviewRole],
  );

  return (
    <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error("usePermissions must be used within PermissionProvider");
  }

  return context;
}

export function useOptionalPermissions() {
  return useContext(PermissionContext);
}
