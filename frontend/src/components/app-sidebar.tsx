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

// This is the data for the RestaurantOS owner dashboard.
const data = {
  teams: [
    {
      name: "RestaurantOS HQ",
      logo: Building,
      plan: "Enterprise",
    },
    {
      name: "Branch 1 (Downtown)",
      logo: Building,
      plan: "Standard",
    }
  ],
  navMain: [
    {
      title: "Operations",
      url: "/owner",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        { title: "Dashboard", url: "/owner" },
        { title: "Orders", url: "#" },
        { title: "Tables", url: "#" },
        { title: "Kitchen", url: "#" },
      ],
    },
    {
      title: "Finance & Sales",
      url: "#",
      icon: Wallet,
      items: [
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
        { title: "Categories", url: "#" },
        { title: "Suppliers", url: "#" },
        { title: "Purchases", url: "#" },
      ],
    },
    {
      title: "HR & Admin",
      url: "#",
      icon: Users,
      items: [
        { title: "Employees", url: "#" },
        { title: "Accounts & Permissions", url: "#" },
        { title: "Reports", url: "#" },
      ],
    },
    {
      title: "System",
      url: "#",
      icon: Settings,
      items: [
        { title: "Synchronization", url: "#" },
        { title: "Settings", url: "#" },
        { title: "License & Subscription", url: "#" },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { currentUser } = useAppStore();

  const user = {
    name: currentUser?.firstName + " " + currentUser?.lastName,
    email: (currentUser as any)?.email || "owner@example.com",
    avatar: "", // could be fetched from user data later
  };

  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-border !bg-sidebar">
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
