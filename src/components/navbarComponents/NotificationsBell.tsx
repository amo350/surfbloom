"use client";

import { BellIcon, MoreVerticalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NotificationsBell = () => {
  // TODO: Fetch notifications count
  // const notificationsCount = notifications?.length ?? 0;
  const notificationsCount = 0; // Placeholder

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="size-5" />
          {/* TODO: Show badge when notificationsCount > 0 */}
          {/* {notificationsCount > 0 && (
            <span className="absolute top-1 right-1 size-2 bg-destructive rounded-full" />
          )} */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {/* Header with title and actions */}
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="px-0">
            Notifications ({notificationsCount})
            {/* TODO: Replace notificationsCount with actual count: {notifications?.length ?? 0} */}
          </DropdownMenuLabel>

          {/* 3-dot menu for bulk actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement mark all as read functionality
                }}
              >
                Mark all as read
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement clear all functionality
                }}
                variant="destructive"
              >
                Clear all
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <DropdownMenuSeparator />

        {/* TODO: Map over notifications and render each notification item */}
        {/* {notifications?.map((notification) => (
          <DropdownMenuItem key={notification.id}>
            {notification.content}
          </DropdownMenuItem>
        )) ?? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        )} */}

        {/* Placeholder empty state */}
        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
          No notifications
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsBell;
