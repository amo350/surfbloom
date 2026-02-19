// src/features/chatbot/components/conversations/ConversationsSidebar.tsx
"use client";

import { Circle, Loader2, MessageCircle, Radio } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useConversations } from "../../hooks/use-chatbot";
import { ChannelBadge } from "./ChannelBadge";

function formatRelativeTime(date: string | Date) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getContactDisplayName(room: any) {
  const contact = room.contact;
  if (!contact) return "Unknown Visitor";

  const fullName = [contact.firstName, contact.lastName]
    .filter(Boolean)
    .join(" ");
  if (fullName) return fullName;
  if (contact.phone) return contact.phone;
  if (contact.email) return contact.email;

  switch (room.channel) {
    case "sms":
      return "SMS Contact";
    case "feedback":
      return "Feedback";
    default:
      return "Chat Visitor";
  }
}

export function ConversationsSidebar({
  workspaceId,
  selectedRoomId,
  onSelectRoom,
  view,
  channel,
  stage,
  categoryId,
}: {
  workspaceId?: string;
  selectedRoomId: string | null;
  onSelectRoom: (id: string) => void;
  view: "all" | "mine" | "unassigned";
  channel: "all" | "webchat" | "sms" | "feedback";
  stage?: string;
  categoryId?: string;
}) {
  const [tab, setTab] = useState<"unread" | "all" | "expired" | "starred">(
    "all",
  );
  const [page, setPage] = useState(1);

  const { data, isLoading } = useConversations({
    workspaceId,
    tab,
    page,
    pageSize: 12,
    channel,
    view,
    stage,
    categoryId,
  });

  return (
    <div className="w-[340px] shrink-0 border-r border-border/40 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 h-12 flex items-center border-b border-border/40 shrink-0">
        <h2 className="text-sm font-semibold">Conversations</h2>
      </div>

      {/* Quick filters */}
      <div className="flex border-b border-border/40 shrink-0">
        {(["unread", "all", "expired", "starred"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
            className={`flex-1 py-2 text-[11px] font-medium capitalize transition-colors ${
              tab === t
                ? "text-teal-600 border-b-2 border-teal-500"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : data?.items.length ? (
          data.items.map((room) => {
            const lastMessage = room.messages?.[0];
            const lastSms = room.smsMessages?.[0];
            const preview = (() => {
              if (lastMessage && lastSms) {
                return new Date(lastSms.createdAt) >
                  new Date(lastMessage.createdAt)
                  ? {
                      text: lastSms.body,
                      time: lastSms.createdAt,
                      isSms: true,
                    }
                  : {
                      text: lastMessage.message,
                      time: lastMessage.createdAt,
                      isSms: false,
                    };
              }
              if (lastSms) {
                return {
                  text: lastSms.body,
                  time: lastSms.createdAt,
                  isSms: true,
                };
              }
              if (lastMessage) {
                return {
                  text: lastMessage.message,
                  time: lastMessage.createdAt,
                  isSms: false,
                };
              }
              return null;
            })();
            const isSelected = room.id === selectedRoomId;
            const isSmsUnread =
              room.channel === "sms" &&
              preview?.isSms &&
              lastSms?.direction === "inbound";
            const isUnseen =
              isSmsUnread ||
              (lastMessage && !lastMessage.seen && lastMessage.role === "USER");

            return (
              <button
                key={room.id}
                type="button"
                onClick={() => onSelectRoom(room.id)}
                className={`w-full text-left px-4 py-3 border-b border-border/20 hover:bg-muted/40 transition-colors ${
                  isSelected ? "bg-muted/60" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <ChannelBadge channel={room.channel ?? "webchat"} />
                        <p className="text-sm font-medium truncate">
                          {getContactDisplayName(room)}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatRelativeTime(room.updatedAt ?? preview?.time ?? new Date())}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p
                        className={`text-xs truncate ${isUnseen ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {preview
                          ? preview.text.substring(0, 50) +
                            (preview.text.length > 50 ? "..." : "")
                          : "No messages yet"}
                      </p>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {room.live && (
                          <Radio className="h-3 w-3 text-green-500" />
                        )}
                        {isUnseen && (
                          <Circle className="h-2 w-2 fill-teal-500 text-teal-500" />
                        )}
                      </div>
                    </div>

                    {/* Domain + workspace tags */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-muted-foreground/60 truncate">
                        {room.domain?.name ?? "Unknown"}
                      </span>
                      {room.workspace && (
                        <>
                          <span className="text-[10px] text-muted-foreground/40">
                            ·
                          </span>
                          <span className="text-[10px] text-muted-foreground/60 truncate">
                            {room.workspace?.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MessageCircle className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              No conversations yet
            </p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              Conversations will appear here when visitors message your chatbot
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="px-4 py-2 border-t border-border/40 flex items-center justify-between shrink-0">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="h-7 text-xs"
          >
            Previous
          </Button>
          <span className="text-[11px] text-muted-foreground">
            {page} / {data.totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="h-7 text-xs"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
