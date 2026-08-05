import * as React from "react"
import {
  Box,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
  Building,
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
      icon: Box,
      items: [
        { title: "Inventory", url: "#" },
        { title: "Products", url: "#" },
        ...(isManager ? [] : [{ title: "Categories", url: "#" }]),
        { title: "Suppliers", url: "#" },
        { title: "Purchases", url: "#" },
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
    <Sidebar collapsible="icon" {...props} className="dark border-r-0 bg-gradient-to-b from-[#0f5132] via-[#0b3f26] to-[#041c10] text-foreground">
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
