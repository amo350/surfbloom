"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChatBotQuickAccess } from "@/features/chatbot/components/ChatBotConfigDialog";
import { DomainSettingsButton } from "@/features/chatbot/components/DomainSettings";
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/use-subscription";
import { authClient } from "@/lib/auth-client";
import NotificationsBell from "./navbarComponents/NotificationsBell";
import UserDropdown from "./navbarComponents/UserDropdown";

const indexMenuItems = [
  {
    title: "Locations",
    href: "/index/locations",
  },
  // {
  //   title: "SEO Score",
  //   href: "/index/seo-score",
  // },
  {
    title: "Conversations",
    href: "/index/conversations",
  },
  {
    title: "Contacts",
    href: "/index/contacts",
  },
  {
    title: "Campaigns",
    href: "/index/campaigns",
  },
  {
    title: "Members",
    href: "/index/members",
  },
  {
    title: "Integrations",
    href: "/index/integrations",
  },
  {
    title: "Account",
    href: "/index/account",
  },
];

const IndexNavbar = () => {
  const pathname = usePathname();
  const { hasActiveSubscription, isLoading } = useHasActiveSubscription();

  const getCurrentPlanName = () => {
    if (hasActiveSubscription) {
      return "Pro Plan";
    }
    return "Free Plan";
  };

  return (
    <nav className="relative flex items-center gap-x-4 px-9 py-2.5 border-b bg-background">
      <Link href="/index/locations" prefetch className="flex items-center">
        <Image
          src="/sloganLogo.png"
          alt="Surfbloom"
          width={120}
          height={28}
          priority
        />
      </Link>
      <Separator orientation="vertical" className="h-6" />
      <div className="flex items-center gap-1">
        {indexMenuItems.map((item) => {
          const isActive = pathname?.startsWith(item.href) ?? false;

          return (
            <div key={item.title} className="relative">
              <Button asChild variant="ghost" size="sm">
                <Link href={item.href} prefetch>
                  {item.title}
                </Link>
              </Button>
              {isActive && (
                <div className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-secondary" />
              )}
            </div>
          );
        })}
      </div>

      <div className="ml-auto pr-2 flex items-center gap-1">
        <ChatBotQuickAccess />
        <DomainSettingsButton />
        <Button asChild variant="ghost" size="icon" title="Integrations">
          <Link href="/index/integrations" prefetch>
            <Plug className="size-5" />
          </Link>
        </Button>
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

export default IndexNavbar;
