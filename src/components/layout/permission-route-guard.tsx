"use client";

import { usePathname } from "next/navigation";

import { AccessRestricted } from "@/components/layout/access-restricted";
import { getRoutePermission } from "@/lib/permissions/route-permissions";
import { usePermissions } from "@/lib/permissions/use-permissions";

type PermissionRouteGuardProps = {
  children: React.ReactNode;
};

export function PermissionRouteGuard({ children }: PermissionRouteGuardProps) {
  const pathname = usePathname();
  const { can } = usePermissions();
  const requiredPermission = getRoutePermission(pathname);

  if (requiredPermission && !can(requiredPermission)) {
    return <AccessRestricted />;
  }

  return children;
}
