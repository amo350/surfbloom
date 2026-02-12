"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/use-subscription";
import { authClient } from "@/lib/auth-client";
import NotificationsBell from "./navbarComponents/NotificationsBell";
import UserDropdown from "./navbarComponents/UserDropdown";

const Navbar = () => {
  const { toggleSidebar } = useSidebar();
  const { hasActiveSubscription, isLoading } = useHasActiveSubscription();

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
    <nav className="relative flex items-center gap-x-4 px-3 py-2.5 border-b bg-background">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="size-8"
      >
        <Menu className="size-5" />
      </Button>
      <Separator orientation="vertical" className="h-6 -mx-2" />
      {/* TODO: Add breadcrumbs, search, user menu, etc. */}
      <div className="ml-auto pr-2 flex items-center gap-1">
        <NotificationsBell />
        {!hasActiveSubscription && !isLoading && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-col items-start h-auto px-3"
            onClick={() => authClient.checkout({ slug: "Pro" })}
          >
            <span className="text-xs leading-tight font-semibold text-foreground-muted">
              {getCurrentPlanName()}
            </span>
            <span className="text-xs leading-tight font-medium">
              Upgrade Now
            </span>
          </Button>
        )}
        <UserDropdown />
      </div>
    </nav>
  );
};

export default Navbar;
