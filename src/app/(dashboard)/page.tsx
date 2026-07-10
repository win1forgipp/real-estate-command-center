import { DashboardCards } from "@/components/dashboard/dashboard-cards";
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

      <DashboardCards cards={dashboardOverviewCards} />
    </div>
  );
}
