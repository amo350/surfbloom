"use client";

import { Loader2, MessageCircle } from "lucide-react";
import { useMessages } from "../../hooks/use-chatbot";

export function FeedbackViewer({
  roomId,
  contactEmail,
  contactPhone,
}: {
  roomId: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
}) {
  const { data: messages, isLoading } = useMessages(roomId);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center">
          <MessageCircle className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-medium">
            {contactEmail || contactPhone || "Anonymous"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Feedback Submission
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {messages?.items?.map((msg) => (
          <div key={msg.id} className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5 bg-amber-50 rounded-bl-md">
              <p className="text-sm whitespace-pre-wrap text-slate-800">
                {msg.message}
              </p>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                {new Date(msg.createdAt).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Feedback submissions are read-only. Follow up via the task created for
          this feedback.
        </p>
      </div>
    </div>
  );
}
