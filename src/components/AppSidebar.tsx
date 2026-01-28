"use client";
import {
  CreditCardIcon,
  FolderOpenIcon,
  HistoryIcon,
  KeyIcon,
  LogOutIcon,
  Settings2Icon,
  StarIcon,
  Users2Icon,
} from "lucide-react";
import Image from "next/image";
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
import { authClient } from "@/lib/auth-client";
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/use-subscription";
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
        getUrl: () => "/tasks",
        getActivePattern: () => /^\/tasks/,
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
    ],
  },
  {
    title: "Organization",
    items: [
      {
        title: "Settings",
        icon: Settings2Icon,
        getUrl: () => "/settings",
        getActivePattern: () => /^\/settings/,
      },
      {
        title: "Members",
        icon: Users2Icon,
        getUrl: () => "/members",
        getActivePattern: () => /^\/members/,
      },
    ],
  },
];

const AppSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { hasActiveSubscription, isLoading } = useHasActiveSubscription();

  // Extract workspaceId from pathname
  const workspaceIdMatch = pathname?.match(/^\/workspaces\/([^/]+)/);
  const workspaceId = workspaceIdMatch ? workspaceIdMatch[1] : undefined;

  // Get current plan name dynamically
  // TODO: Update this to fetch actual plan name from subscription data when available
  const getCurrentPlanName = () => {
    if (hasActiveSubscription) {
      // TODO: Return actual plan name from subscription data
      return "Pro Plan";
    }
    return "Free Plan";
  };
  return (
    <Sidebar
      collapsible="icon"
      style={
        {
          "--sidebar-width": "14rem",
        } as React.CSSProperties
      }
    >
      <SidebarHeader className="relative h-14 flex flex-col p-0">
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="h-14 px-0">
            <WorkspaceSwitcher />
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarSeparator className="absolute bottom-0 left-0 right-0 -mb-px" />
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => {
          return (
            <SidebarGroup key={group.title}>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const url = item.getUrl(workspaceId);
                    const activePattern = item.getActivePattern(workspaceId);
                    const isActive =
                      pathname && activePattern
                        ? activePattern.test(pathname)
                        : false;

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isActive}
                          asChild
                          className={`gap-x-4 h-10 px-4 ${isActive ? "font-semibold" : ""}`}
                        >
                          <Link href={url} prefetch>
                            <item.icon className="size-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Billing Portal"
              className="gap-x-4 h-10 px-4"
              onClick={() => authClient.customer.portal()}
            >
              <CreditCardIcon className="h-4 w-4" />
              <span>Billing Portal</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              className="gap-x-4 h-10 px-4"
              onClick={() =>
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push("/login");
                    },
                  },
                })
              }
            >
              <LogOutIcon className="h-4 w-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
