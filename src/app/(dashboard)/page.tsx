import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { PageHeader } from "@/components/layout/page-header";
import { dashboardOverviewCards } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Today at a glance"
        subtitle="A simple overview of what needs attention across transactions, deadlines, tasks, and listings."
        primaryAction={{ label: "Add Task" }}
        secondaryActions={[{ label: "View Deadlines", variant: "outline" }]}
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {dashboardOverviewCards.map((card) => (
          <DashboardCard key={card.id} data={card} />
        ))}
      </section>
    </div>
  );
}
