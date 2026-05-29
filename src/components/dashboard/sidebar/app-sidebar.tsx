"use client";

import {
  ChartLineIcon,
  GearIcon,
  GlobeIcon,
  LinkSimpleIcon,
  PaintBrushIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import type * as React from "react";
import { NavMain } from "@/components/dashboard/sidebar/nav-main";
import { NavSecondary } from "@/components/dashboard/sidebar/nav-secondary";
import { NavUser } from "@/components/dashboard/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navMain = [
  {
    title: "Links",
    url: "/links",
    icon: <LinkSimpleIcon />,
  },
  {
    title: "Design",
    url: "/design",
    icon: <PaintBrushIcon />,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: <ChartLineIcon />,
  },
];

const navSecondary = [
  {
    title: "Settings",
    url: "/settings",
    icon: <GearIcon />,
  },
  {
    title: "View Public Page",
    url: `/${process.env.NEXT_PUBLIC_USERNAME || ""}`,
    icon: <GlobeIcon />,
    external: true,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/dashboard">
                <Image src="/logo.png" alt="Logo" width={24} height={24} />
                <span className="text-base font-semibold font-heading">
                  Linkora
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
