"use client";

import {
  ChevronDownIcon,
  LogOutIcon,
  PencilIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/use-subscription";
import { authClient } from "@/lib/auth-client";

const UserDropdown = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession(); // TODO: Ensure authClient exposes useSession hook
  const { hasActiveSubscription } = useHasActiveSubscription();

  // Extract display name
  const rawName = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";

  // If name looks like an email (signup stores email as name), default to "User"
  const isNameEmail = rawName.includes("@");
  const fullName = isNameEmail ? "User" : rawName || "User";
  const firstName = fullName.split(" ")[0] || "User";

  // Determine plan label
  const planLabel = hasActiveSubscription ? "Pro" : "Free"; // TODO: Update if more plan tiers exist

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="font-medium gap-1">
          {firstName}
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* User info section */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{fullName}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
            <p className="text-xs text-muted-foreground">
              Plan: <span className="font-medium">{planLabel}</span>
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Navigation items */}
        <DropdownMenuItem asChild>
          <Link href="/index/account" className="cursor-pointer">
            <PencilIcon />
            Edit Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/index/account" className="cursor-pointer">
            <UserIcon />
            View Account
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sign out */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOutIcon />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
