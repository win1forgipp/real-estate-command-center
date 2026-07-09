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
  href?: string;
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
