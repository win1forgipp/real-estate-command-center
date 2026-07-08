"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";

import { usePersistedRecord } from "@/hooks/use-persisted-state";
import { getActiveGroupIds, navigationGroupIds } from "@/lib/navigation";

const NAV_GROUPS_STORAGE_KEY = "nav-groups-expanded";

export function useNavGroupsState() {
  const pathname = usePathname();
  const { value: expandedGroups, setRecord, hydrated } = usePersistedRecord(
    NAV_GROUPS_STORAGE_KEY,
    {},
  );

  const isExpanded = useCallback(
    (groupId: string) => {
      if (expandedGroups[groupId] !== undefined) {
        return expandedGroups[groupId];
      }

      return getActiveGroupIds(pathname).includes(groupId);
    },
    [expandedGroups, pathname],
  );

  const toggleGroup = useCallback(
    (groupId: string) => {
      setRecord((current) => ({
        ...current,
        [groupId]: !isExpanded(groupId),
      }));
    },
    [isExpanded, setRecord],
  );

  return {
    expandedGroups,
    hydrated,
    isExpanded,
    toggleGroup,
    groupIds: navigationGroupIds,
  };
}
