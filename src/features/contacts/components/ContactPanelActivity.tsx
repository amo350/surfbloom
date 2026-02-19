"use client";

import { useState } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActivities } from "../hooks/use-contacts";

const TYPE_LABELS: Record<string, string> = {
  contact_created: "Contact created",
  stage_changed: "Stage changed",
  sms_sent: "SMS sent",
  sms_received: "SMS received",
  chatbot_session: "Chatbot session",
  review_requested: "Review requested",
  review_received: "Review received",
  task_created: "Task created",
  note_added: "Note added",
  feedback_submitted: "Feedback submitted",
  contact_updated: "Contact updated",
};

const TYPE_DOTS: Record<string, string> = {
  contact_created: "bg-blue-400",
  stage_changed: "bg-violet-400",
  sms_sent: "bg-teal-400",
  sms_received: "bg-green-400",
  chatbot_session: "bg-amber-400",
  feedback_submitted: "bg-orange-400",
  task_created: "bg-pink-400",
};

export function ContactPanelActivity({ contactId }: { contactId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useActivities(contactId, page);

  return (
    <div className="p-4">
      {isLoading && page === 1 && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && (!data?.items || data.items.length === 0) && (
        <p className="text-xs text-muted-foreground text-center py-8">
          No activity yet
        </p>
      )}

      {/* Timeline */}
      <div className="space-y-0">
        {data?.items?.map((activity: any, i: number) => (
          <div key={activity.id} className="flex gap-3">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${
                  TYPE_DOTS[activity.type] || "bg-muted-foreground/30"
                }`}
              />
              {i < (data?.items?.length || 0) - 1 && (
                <div className="w-px flex-1 bg-border" />
              )}
            </div>

            {/* Content */}
            <div className="pb-4 min-w-0">
              <p className="text-xs font-medium">
                {TYPE_LABELS[activity.type] || activity.type}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activity.description}
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                {new Date(activity.createdAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      {data && page < data.totalPages && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={isLoading}
            className="text-xs h-7"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <ChevronDown className="h-3 w-3 mr-1" />
            )}
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
