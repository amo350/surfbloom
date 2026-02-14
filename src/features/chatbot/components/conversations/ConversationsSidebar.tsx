// src/features/chatbot/components/conversations/ConversationsSidebar.tsx
"use client";

import { useState } from "react";
import { useConversations, useDomains } from "../../hooks/use-chatbot";
import { formatDistanceToNow } from "date-fns";
import {
  Loader2,
  MessageCircle,
  Circle,
  Radio,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  workspaceId?: string;
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
};

export function ConversationsSidebar({
  workspaceId,
  selectedRoomId,
  onSelectRoom,
}: Props) {
  const [tab, setTab] = useState<"unread" | "all" | "expired" | "starred">("unread");
  const [domainFilter, setDomainFilter] = useState<string | undefined>();
  const [liveFilter, setLiveFilter] = useState<boolean | undefined>();
  const [page, setPage] = useState(1);

  const { data: domains } = useDomains();
  const { data, isLoading } = useConversations({
    workspaceId,
    domainId: domainFilter,
    live: liveFilter,
    tab,
    page,
    pageSize: 12,
  });

  const hasActiveFilters =
    domainFilter !== undefined || liveFilter !== undefined;

  const clearFilters = () => {
    setDomainFilter(undefined);
    setLiveFilter(undefined);
    setPage(1);
  };

  return (
    <div className="w-[340px] shrink-0 border-r border-border/40 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/40 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Conversations</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 text-xs gap-1.5 ${hasActiveFilters ? "text-teal-600" : ""}`}
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
                {hasActiveFilters && (
                  <span className="h-4 w-4 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center">
                    {(domainFilter ? 1 : 0) +
                      (liveFilter !== undefined ? 1 : 0)}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3 space-y-3" align="end">
              {/* Domain filter */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Domain
                </label>
                <select
                  value={domainFilter ?? ""}
                  onChange={(e) => {
                    setDomainFilter(e.target.value || undefined);
                    setPage(1);
                  }}
                  className="w-full h-8 rounded-lg border border-border/60 bg-background px-2 text-xs outline-none"
                >
                  <option value="">All domains</option>
                  {domains?.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Live filter */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Status
                </label>
                <select
                  value={
                    liveFilter === undefined ? "" : liveFilter ? "live" : "bot"
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    setLiveFilter(v === "" ? undefined : v === "live");
                    setPage(1);
                  }}
                  className="w-full h-8 rounded-lg border border-border/60 bg-background px-2 text-xs outline-none"
                >
                  <option value="">All</option>
                  <option value="live">Live (human)</option>
                  <option value="bot">Bot</option>
                </select>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full h-7 text-xs text-muted-foreground"
                >
                  Clear filters
                </Button>
              )}
            </PopoverContent>
          </Popover>
        </div>
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
            const lastMessage = room.messages[0];
            const isSelected = room.id === selectedRoomId;
            const isUnseen =
              lastMessage && !lastMessage.seen && lastMessage.role === "USER";

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
                      <span
                        className={`text-sm truncate ${isUnseen ? "font-semibold" : "font-medium"}`}
                      >
                        {room.contact?.email ?? "Visitor"}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {lastMessage
                          ? formatDistanceToNow(
                              new Date(lastMessage.createdAt),
                              {
                                addSuffix: true,
                              },
                            )
                          : ""}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p
                        className={`text-xs truncate ${isUnseen ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {lastMessage
                          ? lastMessage.message.substring(0, 50) +
                            (lastMessage.message.length > 50 ? "..." : "")
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
