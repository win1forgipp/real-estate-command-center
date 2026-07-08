import {
  CalendarClock,
  Car,
  CheckSquare,
  Contact,
  DollarSign,
  FileText,
  FolderOpen,
  Home,
  LayoutDashboard,
  MapPin,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navigationItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: FileText },
  { label: "Buyers", href: "/buyers", icon: Users },
  { label: "Sellers / Listings", href: "/sellers", icon: Home },
  { label: "Contract Deadlines", href: "/deadlines", icon: CalendarClock },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Contacts", href: "/contacts", icon: Contact },
  { label: "Showings", href: "/showings", icon: MapPin },
  { label: "Documents / Links", href: "/documents", icon: FolderOpen },
  { label: "Templates", href: "/templates", icon: FileText },
  { label: "Commission Tracker", href: "/commissions", icon: DollarSign },
  { label: "Mileage / Expenses", href: "/expenses", icon: Car },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function getPageTitle(pathname: string): string {
  if (pathname === "/") {
    return "Dashboard";
  }

  const match = navigationItems.find((item) => item.href === pathname);
  return match?.label ?? "Dashboard";
}
