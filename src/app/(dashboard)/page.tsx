import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { dashboardOverviewCards } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm md:p-6">
        <h2 className="text-2xl font-semibold text-foreground">
          Today at a glance
        </h2>
        <p className="mt-2 max-w-2xl text-base text-muted-foreground">
          A simple overview of what needs attention across transactions,
          deadlines, tasks, and listings.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {dashboardOverviewCards.map((card) => (
          <DashboardCard key={card.id} data={card} />
        ))}
      </section>
    </div>
  );
}
