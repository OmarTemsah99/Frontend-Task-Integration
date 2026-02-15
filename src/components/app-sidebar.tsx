"use client";

import * as React from "react";
import { Bot, Plus } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAgents } from "@/hooks/use-api-data";

const userData = {
  name: "Test User",
  email: "developer@test.com",
  avatar: "",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { agents } = useAgents();

  const navGroups = React.useMemo(() => {
    const agentItems = agents.map((agent) => ({
      title: agent.name,
      url: `/agents/editAgent?id=${agent.id}`,
      icon: Bot,
    }));

    return [
      {
        label: "AI Call Agent",
        items: [
          { title: "Create Agent", url: "/agents/createAgent", icon: Plus },
          ...agentItems,
        ],
      },
    ];
  }, [agents]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/agents/createAgent">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Bot className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Olimi</span>
                  <span className="truncate text-xs">Dashboard</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={navGroups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
