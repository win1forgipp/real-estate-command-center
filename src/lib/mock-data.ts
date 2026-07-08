import type { StatusVariant } from "@/components/dashboard/status-badge";

export type DashboardListItem = {
  label: string;
  detail?: string;
  status?: StatusVariant;
  statusLabel?: string;
};

export type DashboardCardData = {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  status?: StatusVariant;
  statusLabel?: string;
  items?: DashboardListItem[];
};

export const dashboardOverviewCards: DashboardCardData[] = [
  {
    id: "active-transactions",
    title: "Active Transactions",
    value: "5",
    subtitle: "2 buyer deals, 3 listings",
    status: "info",
    statusLabel: "In progress",
    items: [
      { label: "142 Oak Lane", detail: "Buyer · Under contract" },
      { label: "88 Pine Street", detail: "Seller · Inspection week" },
      { label: "501 Maple Court", detail: "Buyer · Appraisal ordered" },
    ],
  },
  {
    id: "upcoming-deadlines",
    title: "Upcoming Deadlines",
    value: "3",
    subtitle: "Next 7 days",
    status: "warning",
    statusLabel: "Due soon",
    items: [
      {
        label: "Inspection deadline",
        detail: "142 Oak Lane · Thu",
        status: "warning",
        statusLabel: "Due Soon",
      },
      {
        label: "Financing contingency",
        detail: "501 Maple Court · Fri",
        status: "warning",
        statusLabel: "Due Soon",
      },
      {
        label: "EMD due",
        detail: "19 River Road · Mon",
        status: "default",
        statusLabel: "Scheduled",
      },
    ],
  },
  {
    id: "tasks-due-today",
    title: "Tasks Due Today",
    value: "4",
    subtitle: "Needs action today",
    status: "danger",
    statusLabel: "Due today",
    items: [
      { label: "Send repair addendum", detail: "88 Pine Street" },
      { label: "Confirm showing feedback", detail: "Buyer Johnson" },
      { label: "Upload lender pre-approval", detail: "501 Maple Court" },
      { label: "Call title company", detail: "142 Oak Lane" },
    ],
  },
  {
    id: "closings-this-month",
    title: "Closings This Month",
    value: "2",
    subtitle: "Scheduled closings",
    status: "success",
    statusLabel: "On track",
    items: [
      {
        label: "142 Oak Lane",
        detail: "Closing Mar 28",
        status: "success",
        statusLabel: "On track",
      },
      {
        label: "220 Cedar Drive",
        detail: "Closing Mar 31",
        status: "success",
        statusLabel: "On track",
      },
    ],
  },
  {
    id: "commission-pipeline",
    title: "Commission Pipeline",
    value: "$18,400",
    subtitle: "Expected before fees",
    status: "info",
    statusLabel: "Pipeline",
    items: [
      { label: "142 Oak Lane", detail: "$9,200 expected" },
      { label: "220 Cedar Drive", detail: "$6,800 expected" },
      { label: "501 Maple Court", detail: "$2,400 pending" },
    ],
  },
  {
    id: "active-listings",
    title: "Active Listings",
    value: "3",
    subtitle: "Currently on market",
    status: "default",
    statusLabel: "Live",
    items: [
      { label: "88 Pine Street", detail: "Listed 12 days" },
      { label: "615 Birch Ave", detail: "Listed 4 days" },
      { label: "901 Willow Way", detail: "Coming soon" },
    ],
  },
  {
    id: "buyer-leads",
    title: "Buyer Leads",
    value: "6",
    subtitle: "Active buyer clients",
    status: "info",
    statusLabel: "Active",
    items: [
      { label: "Johnson family", detail: "Showing this week" },
      { label: "Martinez buyers", detail: "Needs lender intro" },
      { label: "Taylor search", detail: "New criteria added" },
    ],
  },
  {
    id: "needs-attention",
    title: "Needs Attention",
    value: "3",
    subtitle: "Items to review now",
    status: "danger",
    statusLabel: "Action needed",
    items: [
      {
        label: "Overdue inspection response",
        detail: "88 Pine Street",
        status: "danger",
        statusLabel: "Overdue",
      },
      {
        label: "Missing seller disclosure",
        detail: "615 Birch Ave",
        status: "warning",
        statusLabel: "Due Soon",
      },
      {
        label: "Unsigned commission form",
        detail: "220 Cedar Drive",
        status: "warning",
        statusLabel: "Review",
      },
    ],
  },
];

export const currentUser = {
  name: "Tim",
  role: "Admin",
};
