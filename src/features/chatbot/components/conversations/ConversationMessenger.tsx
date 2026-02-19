// src/features/chatbot/components/conversations/ConversationMessenger.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  useMarkSeen,
  useMessages,
  useRoom,
  useSendMessage,
} from "../../hooks/use-chatbot";
import { MessageBubble } from "../shared/MessageBubble";

const messageSchema = z.object({
  content: z.string().trim().min(1),
});

type MessageForm = z.infer<typeof messageSchema>;

type Props = {
  roomId: string;
};

export function ConversationMessenger({ roomId }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messagePage, setMessagePage] = useState(1);

  const { data: room } = useRoom(roomId);
  const { data: messages, isLoading } = useMessages(roomId, messagePage);
  const sendMessage = useSendMessage(roomId);
  const markSeen = useMarkSeen(roomId);

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

  // Reset page when room changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: run only when roomId changes
  useEffect(() => {
    setMessagePage(1);
  }, [roomId]);

  // Mark messages as seen when opening a conversation (roomId change only)
  // biome-ignore lint/correctness/useExhaustiveDependencies: only run on roomId change to avoid duplicate markSeen on every message update
  useEffect(() => {
    if (
      messages?.items?.some((m) => !m.seen && m.role === "USER") &&
      !markSeen.isPending
    ) {
      markSeen.mutate({ roomId });
    }
  }, [roomId]);

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
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
      >
        {messages && messages.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-2">
            <button
              type="button"
              onClick={() =>
                setMessagePage((p) => Math.min(p + 1, messages.totalPages))
              }
              disabled={messagePage >= messages.totalPages}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 text-xs"
            >
              ← Older
            </button>
            <span className="text-[10px] text-muted-foreground">
              {messagePage} / {messages.totalPages}
            </span>
            <button
              type="button"
              onClick={() => setMessagePage((p) => Math.max(p - 1, 1))}
              disabled={messagePage <= 1}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 text-xs"
            >
              Newer →
            </button>
          </div>
        )}

        {messages?.items && messages.items.length > 0 ? (
          messages.items.map((msg) => (
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
