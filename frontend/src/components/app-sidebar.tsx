import * as React from "react"
import {
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
  Building,
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

const teams = [
  {
    name: "Omnitrack",
    logo: Building,
    plan: "Enterprise",
  },
  {
    name: "Branch 1 (Downtown)",
    logo: Building,
    plan: "Standard",
  }
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { currentUser } = useAppStore();

  const user = {
    name: currentUser?.firstName + " " + currentUser?.lastName,
    email: (currentUser as any)?.email || `${currentUser?.role || 'user'}@example.com`,
    avatar: "", // could be fetched from user data later
  };

  const isManager = currentUser?.role?.toLowerCase() === "manager";
  
  const navMain = [
    {
      title: "Operations",
      url: `/${currentUser?.role?.toLowerCase() || 'owner'}`,
      icon: LayoutDashboard,
      isActive: true,
      items: [
        { title: "Dashboard", url: `/${currentUser?.role?.toLowerCase() || 'owner'}` },
        { title: "Orders", url: "#" },
        { title: "Tables", url: "#" },
        { title: "Kitchen", url: "#" },
      ],
    },
    {
      title: "Finance & Sales",
      url: "#",
      icon: Wallet,
      items: isManager ? [
        { title: "Sales", url: "#" },
        { title: "Expenses", url: "#" },
      ] : [
        { title: "Sales", url: "#" },
        { title: "Payments", url: "#" },
        { title: "Expenses", url: "#" },
      ],
    },
    {
      title: "Inventory & Products",
      url: "#",
      icon: Package,
      items: [
        { title: "Inventory", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/inventory` },
        { title: "Products", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/products` },
        { title: "Suppliers", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/suppliers` },
      ],
    },
    {
      title: "HR & Admin",
      url: "#",
      icon: Users,
      items: isManager ? [
        { title: "Employees", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/employees` },
        { title: "Reports", url: "#" },
      ] : [
        { title: "Employees", url: `/${currentUser?.role?.toLowerCase() || 'owner'}/employees` },
        { title: "Accounts & Permissions", url: "#" },
        { title: "Reports", url: "#" },
      ],
    },
    ...(isManager ? [] : [{
      title: "System",
      url: "#",
      icon: Settings,
      items: [
        { title: "Synchronization", url: "#" },
        { title: "Settings", url: "#" },
        { title: "License & Subscription", url: "#" },
      ],
    }]),
  ];

  return (
    <Sidebar collapsible="icon" {...props} className="dark border-r-0 bg-gradient-to-b from-[#0a3d2a] via-[#062b1a] to-[#021a0e] text-foreground">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
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
