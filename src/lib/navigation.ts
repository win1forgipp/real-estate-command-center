import {
  BriefcaseBusiness,
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

export type NavLinkConfig = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroupConfig = {
  id: string;
  label: string;
  items: NavLinkConfig[];
};

export type NavStandaloneLink = NavLinkConfig & {
  type: "link";
};

export type NavGroup = NavGroupConfig & {
  type: "group";
};

export type NavEntry = NavStandaloneLink | NavGroup;

export const navigationEntries: NavEntry[] = [
  {
    type: "link",
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    type: "group",
    id: "business",
    label: "Business",
    items: [
      { label: "Transactions", href: "/transactions", icon: FileText },
      { label: "Buyers", href: "/buyers", icon: Users },
      { label: "Sellers / Listings", href: "/sellers", icon: Home },
      { label: "Contacts", href: "/contacts", icon: Contact },
      { label: "Showings", href: "/showings", icon: MapPin },
    ],
  },
  {
    type: "group",
    id: "operations",
    label: "Operations",
    items: [
      { label: "Contract Deadlines", href: "/deadlines", icon: CalendarClock },
      { label: "Tasks", href: "/tasks", icon: CheckSquare },
      { label: "Documents / Links", href: "/documents", icon: FolderOpen },
      { label: "Templates", href: "/templates", icon: FileText },
    ],
  },
  {
    type: "group",
    id: "financial",
    label: "Financial",
    items: [
      { label: "Commission Tracker", href: "/commissions", icon: DollarSign },
      { label: "Mileage / Expenses", href: "/expenses", icon: Car },
    ],
  },
  {
    type: "group",
    id: "administration",
    label: "Administration",
    items: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
];

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function getAllNavLinks(): NavLinkConfig[] {
  return navigationEntries.flatMap((entry) =>
    entry.type === "link" ? [entry] : entry.items,
  );
}

export function getNavLinkByHref(pathname: string): NavLinkConfig | undefined {
  return getAllNavLinks().find((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
  );
}

export function getNavGroupByHref(pathname: string): NavGroupConfig | undefined {
  return navigationEntries.find(
    (entry): entry is NavGroup =>
      entry.type === "group" &&
      entry.items.some((item) =>
        item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
      ),
  );
}

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === "/") {
    return [{ label: "Dashboard" }];
  }

  const link = getNavLinkByHref(pathname);
  const group = getNavGroupByHref(pathname);

  if (!link) {
    return [{ label: "Dashboard", href: "/" }, { label: "Dashboard" }];
  }

  if (!group) {
    return [{ label: link.label }];
  }

  return [{ label: group.label }, { label: link.label }];
}

export function getPageTitle(pathname: string): string {
  if (pathname === "/") {
    return "Dashboard";
  }

  return getNavLinkByHref(pathname)?.label ?? "Dashboard";
}

export function getActiveGroupIds(pathname: string): string[] {
  const group = getNavGroupByHref(pathname);
  return group ? [group.id] : [];
}

export const navigationGroupIds = navigationEntries
  .filter((entry): entry is NavGroup => entry.type === "group")
  .map((entry) => entry.id);

export const dashboardQuickActionIcon = BriefcaseBusiness;
