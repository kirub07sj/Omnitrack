import * as React from "react"
import {
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
  Package,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { useAppStore } from "@/store/useAppStore"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const LogoIcon = ({ className }: { className?: string }) => (
  <img src="/logo.png" alt="Logo" className={`w-full h-full object-contain bg-transparent scale-150 ${className || ''}`} />
);

const teams = [
  {
    name: "Omnitrack",
    logo: LogoIcon,
    plan: "",
  },
  {
    name: "Branch 1 (Downtown)",
    logo: LogoIcon,
    plan: "",
  }
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { currentUser, businessSettings, unpaidCounts, fetchUnpaidCounts } = useAppStore();
  const isKitchenActive = businessSettings?.is_kitchen_active ?? true;

  React.useEffect(() => {
    fetchUnpaidCounts();
    const interval = setInterval(fetchUnpaidCounts, 30000);
    return () => clearInterval(interval);
  }, [currentUser?.business_id, fetchUnpaidCounts]);

  const user = {
    name: currentUser?.firstName + " " + currentUser?.lastName,
    email: (currentUser as any)?.email || `${currentUser?.role || 'user'}@example.com`,
    avatar: "", // could be fetched from user data later
  };

  const isManager = currentUser?.role?.toLowerCase() === "manager";
  const isCashier = currentUser?.role?.toLowerCase() === "cashier";
  
  const navMain = [
    {
      title: "Operations",
      url: `/${currentUser?.role?.toLowerCase() || 'owner'}`,
      icon: LayoutDashboard,
      isActive: true,
      items: [
        { title: "Dashboard", url: `/${currentUser?.role?.toLowerCase() || 'owner'}` },
        { title: "Orders (POS)", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/pos` },
        { title: "Tables", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/tables` },
        ...(isKitchenActive && !isCashier ? [{ title: "Kitchen", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/kitchen` }] : []),
      ],
    },
    {
      title: "Finance & Sales",
      url: "#",
      icon: Wallet,
      items: (isManager || isCashier) ? [
        { title: "Sales", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/sales` },
        { title: "Transactions", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/transactions` },
        ...(!isCashier ? [{ title: "Expenses", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/expenses`, badge: unpaidCounts.expenses }] : []),
        { title: "Reports", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/reports` },
      ] : [
        { title: "Sales", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/sales` },
        { title: "Transactions", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/transactions` },
        { title: "Expenses", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/expenses`, badge: unpaidCounts.expenses },
        { title: "Reports", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/reports` },
      ],
    },
    ...(!isCashier ? [{
      title: "Inventory & Products",
      url: "#",
      icon: Package,
      items: [
        { title: "Inventory", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/inventory`, badge: unpaidCounts.purchases },
        { title: "Products", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/products` },
        { title: "Suppliers", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/suppliers` },
      ],
    }] : []),
    ...(!isCashier ? [{
      title: "HR & Admin",
      url: "#",
      icon: Users,
      items: isManager ? [
        { title: "Employees", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/employees` },
      ] : [
        { title: "Employees", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/employees` },
        { title: "Account & Permissions", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/account-permissions` },
      ],
    }] : []),
    ...((isManager || isCashier) ? [] : [{
      title: "System",
      url: "#",
      icon: Settings,
      items: [
        { title: "Synchronization", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/sync` },
        { title: "Settings", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/settings` },
      ],
    }]),
  ];

  return (
    <Sidebar collapsible="icon" {...props} className="dark border-r-0 bg-gradient-to-b from-emerald-900 via-emerald-950 to-gray-950 text-sidebar-foreground">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
