"use client";

import { ChevronDownIcon, PaperclipIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

type TaskMessagingProps = {
  taskId: string;
};

export const TaskMessaging = ({ taskId }: TaskMessagingProps) => {
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Related Tasks - near top, smaller */}
      <div className="px-8 py-3 shrink-0">
        <h3 className="font-semibold text-xs mb-1.5">Related Tasks:</h3>
        <div className="flex gap-1.5 text-xs text-primary">
          <button className="hover:underline">+ New task</button>
          <span className="text-muted-foreground">|</span>
          <button className="hover:underline">+ Existing task</button>
        </div>
      </div>

      {/* Checklist - below Related Tasks, smaller */}
      <div className="px-8 py-3 shrink-0">
        <h3 className="font-semibold text-xs mb-1.5">Checklist:</h3>
        <div className="flex gap-1.5 text-xs text-primary">
          <button className="hover:underline">+ New item</button>
          <span className="text-muted-foreground">|</span>
          <button className="hover:underline">+ Add checklist ▾</button>
        </div>
      </div>

      <div className="flex-1 min-h-0" />

      {/* Message input - stuck to bottom, thin line above */}
      <div className="px-8 py-4 border-t flex items-center gap-3 shrink-0 bg-background">
        <Button size="icon" className="shrink-0">
          <PaperclipIcon className="size-4" />
        </Button>
        <Input
          placeholder="Enter message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-1 shrink-0">
              Share
              <ChevronDownIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Share with team</DropdownMenuItem>
            <DropdownMenuItem>Share externally</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
