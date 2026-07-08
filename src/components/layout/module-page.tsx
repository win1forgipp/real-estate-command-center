"use client";

import { notFound, usePathname } from "next/navigation";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { getPageConfig } from "@/lib/page-config";

export default function ModulePage() {
  const pathname = usePathname();
  const config = getPageConfig(pathname);

  if (!config) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title}
        subtitle={config.subtitle}
        primaryAction={config.primaryAction}
        secondaryActions={config.secondaryActions}
      />
      <EmptyState {...config.emptyState} />
    </div>
  );
}
