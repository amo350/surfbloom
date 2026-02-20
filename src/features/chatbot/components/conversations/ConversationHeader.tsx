"use client";

import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUpdateContact } from "@/features/contacts/hooks/use-contacts";
import { useTRPC } from "@/trpc/client";
import { useUpdateRoom } from "../../hooks/use-chatbot";
import { ChannelBadge } from "./ChannelBadge";

export function ConversationHeader({
  room,
  onContactClick,
  onUnknownContactClick,
}: {
  room: {
    id: string;
    channel: string;
    live?: boolean;
    workspaceId: string | null;
    contact?: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string | null;
      phone: string | null;
      stage: string;
      assignedToId: string | null;
      isContact?: boolean;
    } | null;
  };
  onContactClick?: (contactId: string) => void;
  onUnknownContactClick?: () => void;
}) {
  const trpc = useTRPC();
  const updateRoom = useUpdateRoom();
  const updateContact = useUpdateContact();

  const { data: workspaces } = useQuery(
    trpc.workspaces.getMany.queryOptions({}),
  );

  const contact = room.contact;
  const isKnownContact = !!contact?.isContact;
  const name = isKnownContact && contact
    ? [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
      "Unknown"
    : "Unknown Visitor";

  const handleWorkspaceChange = (workspaceId: string) => {
    if (!contact) return;
    updateContact.mutate({
      id: contact.id,
      workspaceId,
    });
  };

  return (
    <div className="flex items-center gap-3 px-4 h-12 border-b shrink-0">
      {/* Contact info — clickable */}
      {isKnownContact && contact ? (
        <button
          type="button"
          onClick={() => onContactClick?.(contact.id)}
          className="flex items-center gap-2 min-w-0 hover:opacity-70 transition-opacity"
        >
          {/* Square avatar matching panel */}
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-white">
              {[contact.firstName?.[0], contact.lastName?.[0]]
                .filter(Boolean)
                .join("")
                .toUpperCase() || "?"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate leading-tight">{name}</p>
            <p className="text-[11px] text-muted-foreground truncate leading-tight">
              {contact.phone || contact.email || "No contact info"}
            </p>
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onUnknownContactClick?.()}
          className="flex items-center gap-2 min-w-0 hover:opacity-70 transition-opacity"
        >
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-white">?</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate leading-tight">
              Unknown Visitor
            </p>
            <p className="text-[11px] text-teal-600 truncate leading-tight">
              Click to create contact
            </p>
          </div>
        </button>
      )}

      {/* Location — right next to contact */}
      {room.workspaceId && (
        <div className="flex items-center gap-1 shrink-0 ml-1">
          <span className="text-muted-foreground/30">·</span>
          <MapPin className="h-3 w-3 text-muted-foreground/50" />
          <Select
            value={room.workspaceId}
            onValueChange={handleWorkspaceChange}
          >
            <SelectTrigger className="h-6 w-auto max-w-[140px] text-[11px] text-muted-foreground border-none shadow-none bg-transparent px-1 hover:bg-muted/50">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              {workspaces?.items?.map((ws: any) => (
                <SelectItem key={ws.id} value={ws.id} className="text-xs">
                  {ws.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Channel badge */}
      <ChannelBadge channel={room.channel as any} />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Live toggle — webchat only */}
      {room.channel === "webchat" && (
        <div className="flex items-center gap-1.5 shrink-0">
          {room.live && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          )}
          <Switch
            checked={room.live ?? false}
            onCheckedChange={(checked) => {
              updateRoom.mutate({ roomId: room.id, live: checked });
            }}
          />
          <span className="text-[11px] text-muted-foreground">
            {room.live ? "Live" : "AI"}
          </span>
        </div>
      )}
    </div>
  );
}
