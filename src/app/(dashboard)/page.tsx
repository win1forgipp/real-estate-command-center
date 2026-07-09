import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { PageHeader } from "@/components/layout/page-header";
import { getDashboardOverviewCards } from "@/services/dashboard/queries";

export default async function DashboardPage() {
  const dashboardOverviewCards = await getDashboardOverviewCards();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Today at a glance"
        subtitle="A simple overview of what needs attention across transactions, deadlines, tasks, and listings."
        primaryAction={{ actionId: "add_task" }}
        secondaryActions={[{ actionId: "view_deadlines", variant: "outline" }]}
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {dashboardOverviewCards.map((card) => (
          <DashboardCard key={card.id} data={card} />
        ))}
      </section>
    </div>
  );
}
