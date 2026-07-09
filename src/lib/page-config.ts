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

import type { AppActionId } from "@/lib/app-actions";

export type PageAction = {
  actionId: AppActionId;
  variant?: "default" | "outline" | "secondary";
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
    primaryAction: { actionId: "new_transaction" },
    secondaryActions: [{ actionId: "import_deal", variant: "outline" }],
    emptyState: {
      icon: FileText,
      title: "No transactions yet",
      description:
        "Start by adding a buyer or seller transaction to track deadlines, documents, and closing progress in one place.",
      primaryAction: { actionId: "new_transaction" },
      helpText: "You can link contacts, tasks, and commission details later.",
    },
  },
  {
    pathname: "/buyers",
    title: "Buyers",
    subtitle: "Manage buyer clients, search criteria, and showing activity.",
    primaryAction: { actionId: "add_buyer" },
    emptyState: {
      icon: Users,
      title: "No buyer clients yet",
      description:
        "Add buyer profiles to keep preferences, lender info, showing history, and linked transactions together.",
      primaryAction: { actionId: "add_buyer" },
      helpText: "Buyer records can later connect to showings and active deals.",
    },
  },
  {
    pathname: "/sellers",
    title: "Sellers / Listings",
    subtitle: "Manage listing prep, showings, offers, and seller updates.",
    primaryAction: { actionId: "add_listing" },
    emptyState: {
      icon: Home,
      title: "No listings yet",
      description:
        "Create a listing record to track marketing tasks, showings, feedback, offers, and seller documents.",
      primaryAction: { actionId: "add_listing" },
      helpText: "Listing workflows will connect to showings and transaction records.",
    },
  },
  {
    pathname: "/deadlines",
    title: "Contract Deadlines",
    subtitle: "See every important contract date in plain language.",
    primaryAction: { actionId: "add_deadline" },
    emptyState: {
      icon: CalendarClock,
      title: "No deadlines to track yet",
      description:
        "Contract deadlines will appear here with simple labels like Due Today, Due Soon, Overdue, and Complete.",
      primaryAction: { actionId: "add_deadline" },
      helpText: "Deadlines will eventually sync with active transactions automatically.",
    },
  },
  {
    pathname: "/tasks",
    title: "Tasks",
    subtitle: "Keep daily follow-ups tied to clients, properties, and deals.",
    primaryAction: { actionId: "add_task" },
    emptyState: {
      icon: CheckSquare,
      title: "No tasks yet",
      description:
        "Create simple tasks for calls, paperwork, showings, and transaction follow-ups so nothing gets missed.",
      primaryAction: { actionId: "add_task" },
      helpText: "Tasks can be linked to transactions, listings, and contacts later.",
    },
  },
  {
    pathname: "/contacts",
    title: "Contacts",
    subtitle: "Keep buyers, sellers, vendors, and partners in one CRM-style list.",
    primaryAction: { actionId: "add_contact" },
    emptyState: {
      icon: Contact,
      title: "No contacts yet",
      description:
        "Add buyers, sellers, lenders, inspectors, title companies, and vendors so everyone is easy to find.",
      primaryAction: { actionId: "add_contact" },
      helpText: "Contacts will connect to transactions, showings, and tasks.",
    },
  },
  {
    pathname: "/showings",
    title: "Showings",
    subtitle: "Track appointments, buyer feedback, and follow-up items.",
    primaryAction: { actionId: "add_showing" },
    emptyState: {
      icon: MapPin,
      title: "No showings scheduled",
      description:
        "Schedule showings and capture buyer feedback so follow-up actions stay clear and easy to act on.",
      primaryAction: { actionId: "add_showing" },
      helpText: "Showing records will link to buyers and listings.",
    },
  },
  {
    pathname: "/documents",
    title: "Documents / Links",
    subtitle: "Central hub for forms, PDFs, Drive links, and brokerage resources.",
    primaryAction: { actionId: "add_link" },
    emptyState: {
      icon: FolderOpen,
      title: "No documents or links yet",
      description:
        "Save important forms, Google Drive folders, MLS links, and transaction files in one searchable place.",
      primaryAction: { actionId: "add_link" },
      helpText: "Document links can later be attached to transactions and listings.",
    },
  },
  {
    pathname: "/templates",
    title: "Templates",
    subtitle: "Reusable language for emails, addenda, and client updates.",
    primaryAction: { actionId: "add_template" },
    emptyState: {
      icon: FileText,
      title: "No templates yet",
      description:
        "Build reusable templates for addenda, repair responses, buyer emails, seller updates, and closing instructions.",
      primaryAction: { actionId: "add_template" },
      helpText: "Templates will speed up repeat communication across the business.",
    },
  },
  {
    pathname: "/commissions",
    title: "Commission Tracker",
    subtitle: "Track expected and received commissions by transaction.",
    primaryAction: { actionId: "add_commission" },
    emptyState: {
      icon: DollarSign,
      title: "No commission records yet",
      description:
        "Track gross commission, splits, referral fees, broker fees, and net payout status for each deal.",
      primaryAction: { actionId: "add_commission" },
      helpText: "Commission records will connect to closed and pending transactions.",
    },
  },
  {
    pathname: "/expenses",
    title: "Mileage / Expenses",
    subtitle: "Track mileage, business expenses, and simple reports.",
    primaryAction: { actionId: "add_expense" },
    emptyState: {
      icon: Car,
      title: "No expenses recorded yet",
      description:
        "Log mileage and business expenses with categories so reporting stays simple at tax time.",
      primaryAction: { actionId: "add_expense" },
      helpText: "Expense categories and reports will be added in a later milestone.",
    },
  },
  {
    pathname: "/settings",
    title: "Settings",
    subtitle: "Manage users, roles, preferences, and app configuration.",
    primaryAction: { actionId: "open_settings", variant: "outline" },
    emptyState: {
      icon: Settings,
      title: "Settings are not configured yet",
      description:
        "This area will manage users, roles, integrations, database settings, and app preferences.",
      primaryAction: { actionId: "open_settings" },
      helpText: "Authentication and role management will be added in a future milestone.",
    },
  },
];

export function getPageConfig(pathname: string): PageConfig | undefined {
  return pageConfigs.find((config) => config.pathname === pathname);
}
