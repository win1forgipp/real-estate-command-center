"use client";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import type { DashboardCardData } from "@/lib/mock-data";
import { DASHBOARD_CARD_PERMISSIONS } from "@/lib/permissions/route-permissions";
import { usePermissions } from "@/lib/permissions/use-permissions";

type DashboardCardsProps = {
  cards: DashboardCardData[];
};

export function DashboardCards({ cards }: DashboardCardsProps) {
  const { can } = usePermissions();

  const visibleCards = cards.filter((card) => {
    const permission = DASHBOARD_CARD_PERMISSIONS[card.id];
    return !permission || can(permission);
  });

  if (!visibleCards.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No dashboard items are visible for the current preview role.
      </p>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {visibleCards.map((card) => (
        <DashboardCard key={card.id} data={card} />
      ))}
    </section>
  );
}
