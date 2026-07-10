"use client";

import { Eye, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePermissions } from "@/lib/permissions/use-permissions";

export function ViewAsBanner() {
  const { isPreviewing, previewRoleLabel, resetPreviewRole } = usePermissions();

  if (!isPreviewing) {
    return null;
  }

  return (
    <div className="border-b border-warning/40 bg-warning/10 px-4 py-2 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Eye className="size-4 text-warning" />
          <span>
            Viewing as: <strong>{previewRoleLabel}</strong>
          </span>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={resetPreviewRole}>
          <X className="size-4" />
          Return to Administrator View
        </Button>
      </div>
    </div>
  );
}
