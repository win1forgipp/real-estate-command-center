import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  CheckSquare,
  DollarSign,
  FileText,
  Home,
  TrendingDown,
  Users,
} from "lucide-react";

import type { StatusVariant } from "@/components/dashboard/status-badge";

export type DashboardCardIcon =
  | "transactions"
  | "deadlines"
  | "tasks"
  | "closings"
  | "commissions"
  | "listings"
  | "buyers"
  | "attention";

export type DashboardListItem = {
  label: string;
  detail?: string;
  status?: StatusVariant;
  statusLabel?: string;
};

export type DashboardTrend = {
  label: string;
  direction: "up" | "down" | "neutral";
};

export type DashboardCardData = {
  id: string;
  icon: DashboardCardIcon;
  title: string;
  value: string;
  description: string;
  status?: StatusVariant;
  statusLabel?: string;
  trend?: DashboardTrend;
  href?: string;
  items?: DashboardListItem[];
};

export const dashboardCardIcons: Record<DashboardCardIcon, LucideIcon> = {
  transactions: FileText,
  deadlines: CalendarClock,
  tasks: CheckSquare,
  closings: Home,
  commissions: DollarSign,
  listings: Home,
  buyers: Users,
  attention: TrendingDown,
};

export const dashboardOverviewCards: DashboardCardData[] = [
  {
    id: "active-transactions",
    icon: "transactions",
    title: "Active Transactions",
    value: "5",
    description: "2 buyer deals, 3 listings",
    status: "info",
    statusLabel: "In progress",
    trend: { label: "+1 this week", direction: "up" },
    href: "/transactions",
    items: [
      { label: "142 Oak Lane", detail: "Buyer · Under contract" },
      { label: "88 Pine Street", detail: "Seller · Inspection week" },
      { label: "501 Maple Court", detail: "Buyer · Appraisal ordered" },
    ],
  },
  {
    id: "upcoming-deadlines",
    icon: "deadlines",
    title: "Upcoming Deadlines",
    value: "3",
    description: "Next 7 days",
    status: "warning",
    statusLabel: "Due soon",
    trend: { label: "2 due this week", direction: "neutral" },
    href: "/deadlines",
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
    icon: "tasks",
    title: "Tasks Due Today",
    value: "4",
    description: "Needs action today",
    status: "danger",
    statusLabel: "Due today",
    trend: { label: "2 overdue", direction: "down" },
    href: "/tasks",
    items: [
      { label: "Send repair addendum", detail: "88 Pine Street" },
      { label: "Confirm showing feedback", detail: "Buyer Johnson" },
      { label: "Upload lender pre-approval", detail: "501 Maple Court" },
      { label: "Call title company", detail: "142 Oak Lane" },
    ],
  },
  {
    id: "closings-this-month",
    icon: "closings",
    title: "Closings This Month",
    value: "2",
    description: "Scheduled closings",
    status: "success",
    statusLabel: "On track",
    trend: { label: "On schedule", direction: "up" },
    href: "/transactions",
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
    icon: "commissions",
    title: "Commission Pipeline",
    value: "$18,400",
    description: "Expected before fees",
    status: "info",
    statusLabel: "Pipeline",
    trend: { label: "+$4,200 pending", direction: "up" },
    href: "/commissions",
    items: [
      { label: "142 Oak Lane", detail: "$9,200 expected" },
      { label: "220 Cedar Drive", detail: "$6,800 expected" },
      { label: "501 Maple Court", detail: "$2,400 pending" },
    ],
  },
  {
    id: "active-listings",
    icon: "listings",
    title: "Active Listings",
    value: "3",
    description: "Currently on market",
    status: "default",
    statusLabel: "Live",
    trend: { label: "1 new listing", direction: "up" },
    href: "/sellers",
    items: [
      { label: "88 Pine Street", detail: "Listed 12 days" },
      { label: "615 Birch Ave", detail: "Listed 4 days" },
      { label: "901 Willow Way", detail: "Coming soon" },
    ],
  },
  {
    id: "buyer-leads",
    icon: "buyers",
    title: "Buyer Leads",
    value: "6",
    description: "Active buyer clients",
    status: "info",
    statusLabel: "Active",
    trend: { label: "+2 new leads", direction: "up" },
    href: "/buyers",
    items: [
      { label: "Johnson family", detail: "Showing this week" },
      { label: "Martinez buyers", detail: "Needs lender intro" },
      { label: "Taylor search", detail: "New criteria added" },
    ],
  },
  {
    id: "needs-attention",
    icon: "attention",
    title: "Needs Attention",
    value: "3",
    description: "Items to review now",
    status: "danger",
    statusLabel: "Action needed",
    trend: { label: "1 overdue item", direction: "down" },
    href: "/tasks",
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

export type MockNotification = {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread?: boolean;
};

export const mockNotifications: MockNotification[] = [
  {
    id: "1",
    title: "Inspection deadline tomorrow",
    detail: "142 Oak Lane needs a response",
    time: "2h ago",
    unread: true,
  },
  {
    id: "2",
    title: "Task due today",
    detail: "Upload lender pre-approval for 501 Maple Court",
    time: "4h ago",
    unread: true,
  },
  {
    id: "3",
    title: "Showing feedback added",
    detail: "Buyer Johnson left notes on 615 Birch Ave",
    time: "Yesterday",
  },
];

export type MockSearchResult = {
  id: string;
  label: string;
  category: "contacts" | "transactions" | "properties" | "documents" | "templates";
  detail: string;
};

export const mockSearchResults: MockSearchResult[] = [
  {
    id: "search-1",
    label: "142 Oak Lane",
    category: "transactions",
    detail: "Buyer transaction · Under contract",
  },
  {
    id: "search-2",
    label: "Johnson family",
    category: "contacts",
    detail: "Buyer client · Showing this week",
  },
  {
    id: "search-3",
    label: "615 Birch Ave",
    category: "properties",
    detail: "Active listing · Listed 4 days",
  },
  {
    id: "search-4",
    label: "Inspection addendum template",
    category: "templates",
    detail: "Reusable repair response language",
  },
  {
    id: "search-5",
    label: "Seller disclosure packet",
    category: "documents",
    detail: "Google Drive link · Listing prep",
  },
];

export const currentUser = {
  name: "Tim",
  role: "Admin",
  initials: "T",
};
