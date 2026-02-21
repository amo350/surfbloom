"use client";

import { ArrowRight, MessageSquare, Sparkles, User } from "lucide-react";

export function AutoReplyLogsCard({
  autoReply,
  autoReplyStats,
  recentAutoReplies,
}: {
  autoReply: { enabled: boolean; tone: string; maxReplies: number } | null;
  autoReplyStats: { _count: number } | null;
  recentAutoReplies: any[];
}) {
  if (!autoReply?.enabled) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            AI Auto-Replies
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageSquare className="h-3 w-3 text-violet-500" />
          <span className="text-sm font-semibold">
            {autoReplyStats?._count || 0}
          </span>
          <span className="text-xs text-muted-foreground">AI replies sent</span>
        </div>
      </div>

      {recentAutoReplies.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            No AI replies sent yet. They&apos;ll appear here when contacts
            respond to your campaign.
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {recentAutoReplies.map((log: any) => {
            const contact = log.recipient?.contact;
            const name = contact
              ? [contact.firstName, contact.lastName].filter(Boolean).join(" ")
              : contact?.phone || "Unknown";

            return (
              <div key={log.id} className="px-4 py-3 space-y-2">
                {/* Contact + time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">{name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Exchange */}
                <div className="flex items-start gap-2">
                  {/* Inbound */}
                  <div className="flex-1">
                    <p className="text-[10px] font-medium text-muted-foreground mb-0.5">
                      Customer
                    </p>
                    <div className="bg-slate-100 rounded-lg rounded-bl-md px-2.5 py-1.5">
                      <p className="text-xs">{log.inboundMessage}</p>
                    </div>
                  </div>

                  <ArrowRight className="h-3 w-3 text-muted-foreground mt-5 shrink-0" />

                  {/* AI reply */}
                  <div className="flex-1">
                    <p className="text-[10px] font-medium text-violet-500 mb-0.5">
                      AI Reply
                    </p>
                    <div className="bg-violet-50 border border-violet-100 rounded-lg rounded-br-md px-2.5 py-1.5">
                      <p className="text-xs">{log.aiResponse}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
