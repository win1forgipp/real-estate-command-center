import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  Car,
  CheckSquare,
  Contact,
  DollarSign,
  FileText,
  FolderOpen,
  Home,
  MapPin,
  Settings,
  Users,
} from "lucide-react";

export type PageAction = {
  label: string;
  variant?: "default" | "outline" | "secondary";
  onClick?: () => void;
};

export type PageConfig = {
  pathname: string;
  title: string;
  subtitle: string;
  primaryAction: PageAction;
  secondaryActions?: PageAction[];
  emptyState: {
    icon: LucideIcon;
    title: string;
    description: string;
    primaryAction: PageAction;
    helpText: string;
  };
};

export const pageConfigs: PageConfig[] = [
  {
    pathname: "/transactions",
    title: "Transactions",
    subtitle: "Track buyer and seller deals from contract to closing.",
    primaryAction: { label: "Add Transaction" },
    secondaryActions: [{ label: "Import Deal", variant: "outline" }],
    emptyState: {
      icon: FileText,
      title: "No transactions yet",
      description:
        "Start by adding a buyer or seller transaction to track deadlines, documents, and closing progress in one place.",
      primaryAction: { label: "Add Transaction" },
      helpText: "You can link contacts, tasks, and commission details later.",
    },
  },
  {
    pathname: "/buyers",
    title: "Buyers",
    subtitle: "Manage buyer clients, search criteria, and showing activity.",
    primaryAction: { label: "Add Buyer" },
    emptyState: {
      icon: Users,
      title: "No buyer clients yet",
      description:
        "Add buyer profiles to keep preferences, lender info, showing history, and linked transactions together.",
      primaryAction: { label: "Add Buyer" },
      helpText: "Buyer records can later connect to showings and active deals.",
    },
  },
  {
    pathname: "/sellers",
    title: "Sellers / Listings",
    subtitle: "Manage listing prep, showings, offers, and seller updates.",
    primaryAction: { label: "Add Listing" },
    emptyState: {
      icon: Home,
      title: "No listings yet",
      description:
        "Create a listing record to track marketing tasks, showings, feedback, offers, and seller documents.",
      primaryAction: { label: "Add Listing" },
      helpText: "Listing workflows will connect to showings and transaction records.",
    },
  },
  {
    pathname: "/deadlines",
    title: "Contract Deadlines",
    subtitle: "See every important contract date in plain language.",
    primaryAction: { label: "Add Deadline" },
    emptyState: {
      icon: CalendarClock,
      title: "No deadlines to track yet",
      description:
        "Contract deadlines will appear here with simple labels like Due Today, Due Soon, Overdue, and Complete.",
      primaryAction: { label: "Add Deadline" },
      helpText: "Deadlines will eventually sync with active transactions automatically.",
    },
  },
  {
    pathname: "/tasks",
    title: "Tasks",
    subtitle: "Keep daily follow-ups tied to clients, properties, and deals.",
    primaryAction: { label: "Add Task" },
    emptyState: {
      icon: CheckSquare,
      title: "No tasks yet",
      description:
        "Create simple tasks for calls, paperwork, showings, and transaction follow-ups so nothing gets missed.",
      primaryAction: { label: "Add Task" },
      helpText: "Tasks can be linked to transactions, listings, and contacts later.",
    },
  },
  {
    pathname: "/contacts",
    title: "Contacts",
    subtitle: "Keep buyers, sellers, vendors, and partners in one CRM-style list.",
    primaryAction: { label: "Add Contact" },
    emptyState: {
      icon: Contact,
      title: "No contacts yet",
      description:
        "Add buyers, sellers, lenders, inspectors, title companies, and vendors so everyone is easy to find.",
      primaryAction: { label: "Add Contact" },
      helpText: "Contacts will connect to transactions, showings, and tasks.",
    },
  },
  {
    pathname: "/showings",
    title: "Showings",
    subtitle: "Track appointments, buyer feedback, and follow-up items.",
    primaryAction: { label: "Schedule Showing" },
    emptyState: {
      icon: MapPin,
      title: "No showings scheduled",
      description:
        "Schedule showings and capture buyer feedback so follow-up actions stay clear and easy to act on.",
      primaryAction: { label: "Schedule Showing" },
      helpText: "Showing records will link to buyers and listings.",
    },
  },
  {
    pathname: "/documents",
    title: "Documents / Links",
    subtitle: "Central hub for forms, PDFs, Drive links, and brokerage resources.",
    primaryAction: { label: "Add Link" },
    emptyState: {
      icon: FolderOpen,
      title: "No documents or links yet",
      description:
        "Save important forms, Google Drive folders, MLS links, and transaction files in one searchable place.",
      primaryAction: { label: "Add Link" },
      helpText: "Document links can later be attached to transactions and listings.",
    },
  },
  {
    pathname: "/templates",
    title: "Templates",
    subtitle: "Reusable language for emails, addenda, and client updates.",
    primaryAction: { label: "Create Template" },
    emptyState: {
      icon: FileText,
      title: "No templates yet",
      description:
        "Build reusable templates for addenda, repair responses, buyer emails, seller updates, and closing instructions.",
      primaryAction: { label: "Create Template" },
      helpText: "Templates will speed up repeat communication across the business.",
    },
  },
  {
    pathname: "/commissions",
    title: "Commission Tracker",
    subtitle: "Track expected and received commissions by transaction.",
    primaryAction: { label: "Add Commission" },
    emptyState: {
      icon: DollarSign,
      title: "No commission records yet",
      description:
        "Track gross commission, splits, referral fees, broker fees, and net payout status for each deal.",
      primaryAction: { label: "Add Commission" },
      helpText: "Commission records will connect to closed and pending transactions.",
    },
  },
  {
    pathname: "/expenses",
    title: "Mileage / Expenses",
    subtitle: "Track mileage, business expenses, and simple reports.",
    primaryAction: { label: "Add Expense" },
    emptyState: {
      icon: Car,
      title: "No expenses recorded yet",
      description:
        "Log mileage and business expenses with categories so reporting stays simple at tax time.",
      primaryAction: { label: "Add Expense" },
      helpText: "Expense categories and reports will be added in a later milestone.",
    },
  },
  {
    pathname: "/settings",
    title: "Settings",
    subtitle: "Manage users, roles, preferences, and app configuration.",
    primaryAction: { label: "Open Preferences", variant: "outline" },
    emptyState: {
      icon: Settings,
      title: "Settings are not configured yet",
      description:
        "This area will manage users, roles, integrations, database settings, and app preferences.",
      primaryAction: { label: "Open Preferences" },
      helpText: "Authentication and role management will be added in a future milestone.",
    },
  },
];

export function getPageConfig(pathname: string): PageConfig | undefined {
  return pageConfigs.find((config) => config.pathname === pathname);
}
