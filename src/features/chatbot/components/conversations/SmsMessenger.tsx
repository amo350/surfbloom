"use client";

import { AlertCircle, Check, CheckCheck, Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSendSmsReply, useSmsMessages } from "../../hooks/use-chatbot";

function SmsStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "DELIVERED":
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    case "SENT":
      return <Check className="h-3 w-3 text-muted-foreground" />;
    case "FAILED":
    case "UNDELIVERED":
      return <AlertCircle className="h-3 w-3 text-red-500" />;
    default:
      return <Check className="h-3 w-3 text-muted-foreground/50" />;
  }
}

export function SmsMessenger({
  roomId,
  contactPhone,
}: {
  roomId: string;
  contactPhone: string;
}) {
  const [page, setPage] = useState(1);
  const { data: messages, isLoading } = useSmsMessages(roomId, page);
  const sendReply = useSendSmsReply();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: rerun when fetched messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset draft and page when room changes
  useEffect(() => {
    setPage(1);
    setDraft("");
  }, [roomId]);

  const handleSend = () => {
    if (!draft.trim()) return;
    sendReply.mutate(
      { roomId, message: draft.trim() },
      {
        onSuccess: () => {
          setDraft("");
          setPage(1);
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {/* Older messages indicator */}
        {messages && messages.totalPages > 1 && page < messages.totalPages && (
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground py-2"
          >
            Load older messages
          </button>
        )}

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {messages?.items?.map((msg) => {
          const isOutbound = msg.direction === "outbound";
          return (
            <div
              key={msg.id}
              className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${
                  isOutbound
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-muted rounded-bl-md"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                <div
                  className={`flex items-center gap-1 mt-1 ${
                    isOutbound ? "justify-end" : "justify-start"
                  }`}
                >
                  <span
                    className={`text-[10px] ${
                      isOutbound ? "text-white/60" : "text-muted-foreground"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  {isOutbound && <SmsStatusIcon status={msg.status} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply input */}
      <div className="px-4 py-3 border-t">
        <div className="flex gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type an SMS reply..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sendReply.isPending || !draft.trim()}
            className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition-colors shrink-0"
          >
            {sendReply.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          SMS · {draft.length}/1600
        </p>
      </div>
    </div>
  );
}
