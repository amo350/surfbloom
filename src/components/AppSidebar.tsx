"use client";
import {
  CogIcon,
  CreditCardIcon,
  FolderOpenIcon,
  HistoryIcon,
  LogOutIcon,
  StarIcon,
  Users2Icon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GoCheckCircle,
  GoCheckCircleFill,
  GoHome,
  GoHomeFill,
} from "react-icons/go";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/use-subscription";
import { authClient } from "@/lib/auth-client";
import { WorkspaceSwitcher } from "./WorkplaceSwitcher";

const menuItems = [
  {
    title: "Main",
    items: [
      {
        title: "Home",
        icon: GoHome,
        activeIcon: GoHomeFill,
        getUrl: () => "#",
        getActivePattern: () => /^\/$/,
      },
      {
        title: "My Tasks",
        icon: GoCheckCircle,
        activeIcon: GoCheckCircleFill,
        getUrl: (workspaceId?: string) =>
          workspaceId ? `/workspaces/${workspaceId}/tasks` : "/index/locations",
        getActivePattern: (workspaceId?: string) =>
          workspaceId
            ? new RegExp(`^/workspaces/${workspaceId}/tasks`)
            : /^\/tasks/,
      },
    ],
  },
  {
    title: "Workflows",
    items: [
      {
        title: "Workflows",
        icon: FolderOpenIcon,
        getUrl: (workspaceId?: string) =>
          workspaceId
            ? `/workspaces/${workspaceId}/workflows`
            : "/index/locations",
        getActivePattern: (workspaceId?: string) =>
          workspaceId
            ? new RegExp(`^/workspaces/${workspaceId}/workflows`)
            : /^\/workflows/,
      },
      {
        title: "Executions",
        icon: HistoryIcon,
        getUrl: (workspaceId?: string) =>
          workspaceId
            ? `/workspaces/${workspaceId}/executions`
            : "/index/locations",
        getActivePattern: (workspaceId?: string) =>
          workspaceId
            ? new RegExp(`^/workspaces/${workspaceId}/executions`)
            : /^\/executions/,
      },
      {
        title: "Reviews",
        icon: StarIcon,
        getUrl: (workspaceId?: string) =>
          workspaceId
            ? `/workspaces/${workspaceId}/reviews`
            : "/index/locations",
        getActivePattern: (workspaceId?: string) =>
          workspaceId
            ? new RegExp(`^/workspaces/${workspaceId}/reviews`)
            : /^\/reviews/,
      },
    ],
  },
  {
    title: "Organization",
    items: [
      {
        title: "Settings",
        icon: CogIcon,
        getUrl: (workspaceId?: string) =>
          workspaceId
            ? `/workspaces/${workspaceId}/settings`
            : "/index/locations",
        getActivePattern: (workspaceId?: string) =>
          workspaceId
            ? new RegExp(`^/workspaces/${workspaceId}/settings`)
            : /^\/settings/,
      },
      {
        title: "Members",
        icon: Users2Icon,
        getUrl: (workspaceId?: string) =>
          workspaceId
            ? `/workspaces/${workspaceId}/members`
            : "/index/locations",
        getActivePattern: (workspaceId?: string) =>
          workspaceId
            ? new RegExp(`^/workspaces/${workspaceId}/members`)
            : /^\/members/,
      },
    ],
  },
];

const AppSidebar = () => {
  const pathname = usePathname();

  const workspaceIdMatch = pathname?.match(/^\/workspaces\/([^/]+)/);
  const workspaceId = workspaceIdMatch ? workspaceIdMatch[1] : undefined;

  const projectGroups = menuItems.filter(
    (group) => group.title !== "Organization",
  );

  const organizationGroup = menuItems.find(
    (group) => group.title === "Organization",
  );

  return (
    <Sidebar
      collapsible="icon"
      style={
        {
          "--sidebar-width": "14rem",
        } as React.CSSProperties
      }
    >
      {/* ───────── Header ───────── */}
      <SidebarHeader className="relative h-14 p-0">
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="h-14 px-0">
            <WorkspaceSwitcher />
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarSeparator className="absolute bottom-0 left-0 right-0 -mb-px" />
      </SidebarHeader>

      {/* ───────── Main Content ───────── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectGroups.flatMap((group) =>
                group.items.map((item) => {
                  const url = item.getUrl(workspaceId);
                  const activePattern = item.getActivePattern(workspaceId);
                  const isActive =
                    pathname && activePattern
                      ? activePattern.test(pathname)
                      : false;

                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                        asChild
                        className="h-10 px-4 gap-x-4"
                      >
                        <Link href={url} prefetch>
                          <Icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ───────── Footer ───────── */}
      <SidebarFooter className="py-3">
        <SidebarSeparator className="mb-2 w-full shrink-0" />
        <SidebarMenu
          className="
            flex gap-1 px-3
            flex-row justify-between
            group-data-[collapsible=icon]:flex-col
            group-data-[collapsible=icon]:items-center
          "
        >
          {organizationGroup?.items.map((item) => {
            const Icon = item.icon;
            const url = item.getUrl(workspaceId);
            const activePattern = item.getActivePattern(workspaceId);
            const isActive =
              pathname && activePattern ? activePattern.test(pathname) : false;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  asChild
                  className="h-9 w-9 justify-center rounded-full transition-shadow data-[active=true]:ring-2 data-[active=true]:ring-primary/50 data-[active=true]:shadow-[0_0_12px_rgb(0_0_0/0.12)] dark:data-[active=true]:shadow-[0_0_14px_rgb(255_255_255/0.15)]"
                >
                  <Link href={url}>
                    <Icon className="h-4 w-4" />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}

          {/* Billing */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Billing"
              className="h-9 w-9 justify-center"
              onClick={() => authClient.customer.portal()}
            >
              <CreditCardIcon className="h-4 w-4" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
