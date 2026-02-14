// src/features/chatbot/components/conversations/ConversationMessenger.tsx
"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useMessages,
  useSendMessage,
  useMarkSeen,
  useRoom,
  useUpdateRoom,
} from "../../hooks/use-chatbot";
import { MessageBubble } from "../shared/MessageBubble";
import { Switch } from "@/components/ui/switch";
import { Loader2, Send, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const messageSchema = z.object({
  content: z.string().trim().min(1),
});

type MessageForm = z.infer<typeof messageSchema>;

type Props = {
  roomId: string;
};

export function ConversationMessenger({ roomId }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: room } = useRoom(roomId);
  const { data: messages, isLoading } = useMessages(roomId);
  const sendMessage = useSendMessage(roomId);
  const markSeen = useMarkSeen(roomId);
  const updateRoom = useUpdateRoom();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
  });

  // Scroll to bottom on new messages
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when messages change
  useEffect(() => {
    scrollRef.current?.scroll({
      top: scrollRef.current.scrollHeight,
      left: 0,
      behavior: "smooth",
    });
  }, [messages]);

  // Mark messages as seen when room loads
  // biome-ignore lint/correctness/useExhaustiveDependencies: run when room or messages change; markSeen.mutate is stable
  useEffect(() => {
    if (messages?.some((m) => !m.seen && m.role === "USER")) {
      markSeen.mutate({ roomId });
    }
  }, [roomId, messages]);

  const onSubmit = handleSubmit((values) => {
    sendMessage.mutate(
      { roomId, message: values.content },
      { onSuccess: () => reset() },
    );
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 border-b border-border/40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {room?.contact?.email ?? "Visitor"}
            </p>
            <div className="flex items-center gap-1.5">
              {room?.domain && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Globe className="h-2.5 w-2.5" />
                  {room.domain.name}
                </span>
              )}
              {room?.workspace && (
                <>
                  <span className="text-[10px] text-muted-foreground/40">·</span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <MapPin className="h-2.5 w-2.5" />
                    {room.workspace.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Realtime toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {room?.live && (
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-[11px] font-medium text-green-600">Live</span>
            </span>
          )}
          <Switch
            checked={room?.live ?? false}
            onCheckedChange={(checked) => {
              updateRoom.mutate({ roomId, live: checked });
            }}
            disabled={updateRoom.isPending}
          />
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
      >
        {messages && messages.length > 0 ? (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.message}
              createdAt={msg.createdAt}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No messages in this conversation
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={onSubmit}
        className="shrink-0 border-t border-border/40 px-4 py-3 flex gap-2"
      >
        <input
          {...register("content")}
          type="text"
          placeholder="Type a reply..."
          autoComplete="off"
          className="flex-1 h-10 rounded-xl border border-border/40 bg-muted/30 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 transition-shadow"
        />
        <Button
          type="submit"
          disabled={sendMessage.isPending}
          className="h-10 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 border-0"
        >
          {sendMessage.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}