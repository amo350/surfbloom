"use client";

import { useState } from "react";
import {
  X,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  MoreHorizontal,
  MessageCircle,
  UserPlus,
  ArrowUpDown,
  FileText,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContact } from "../hooks/use-contacts";
import { ContactPanelDetails } from "./ContactPanelDetail";
import { ContactPanelActivity } from "./ContactPanelActivity";

const ACTIVITY_CONFIG: Record<string, { icon: any; bg: string; text: string }> = {
  contact_created: { icon: UserPlus, bg: "bg-blue-500", text: "text-white" },
  stage_changed: { icon: ArrowUpDown, bg: "bg-violet-500", text: "text-white" },
  sms_sent: { icon: MessageSquare, bg: "bg-teal-500", text: "text-white" },
  sms_received: { icon: MessageCircle, bg: "bg-green-500", text: "text-white" },
  chatbot_session: { icon: MessageCircle, bg: "bg-amber-500", text: "text-white" },
  feedback_submitted: { icon: FileText, bg: "bg-orange-500", text: "text-white" },
  review_requested: { icon: Star, bg: "bg-pink-500", text: "text-white" },
  review_received: { icon: Star, bg: "bg-yellow-500", text: "text-white" },
  task_created: { icon: FileText, bg: "bg-indigo-500", text: "text-white" },
  note_added: { icon: FileText, bg: "bg-slate-500", text: "text-white" },
  contact_updated: { icon: UserPlus, bg: "bg-sky-500", text: "text-white" },
};

function getInitials(first?: string | null, last?: string | null) {
  return [first?.[0], last?.[0]].filter(Boolean).join("").toUpperCase() || "?";
}

function relativeTime(date: string | Date) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 30) return `${diffDays}d`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function ContactPanel({
  contactId,
  onClose,
}: {
  contactId: string;
  onClose: () => void;
}) {
  const { data: contact, isLoading } = useContact(contactId);
  const [tab, setTab] = useState<"details" | "activity">("details");

  if (isLoading) {
    return (
      <div className="w-[340px] border-l bg-background flex items-center justify-center shrink-0">
        <div className="h-5 w-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="w-[340px] border-l bg-background flex items-center justify-center shrink-0">
        <p className="text-sm text-muted-foreground">Contact not found</p>
      </div>
    );
  }

  const name =
    [contact.firstName, contact.lastName].filter(Boolean).join(" ") || "Unknown";
  const initials = getInitials(contact.firstName, contact.lastName);

  return (
    <div className="w-[340px] border-l bg-background flex flex-col h-full shrink-0">
      {/* Header — left aligned, like reference */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Square avatar with rounded corners */}
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-sm font-bold text-white">{initials}</span>
          </div>

          {/* Name + contact */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-[15px] font-semibold truncate leading-tight">
              {name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {contact.phone || contact.email || "No contact info"}
            </p>
            {contact.workspace?.name && (
              <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                {contact.workspace.name}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      {contact.activities?.length > 0 && (
        <div className="px-4 pb-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Recent Activity
          </p>
          <div className="space-y-2">
            {contact.activities.slice(0, 3).map((a: any) => {
              const config =
                ACTIVITY_CONFIG[a.type] || ACTIVITY_CONFIG.contact_updated;
              const Icon = config.icon;
              return (
                <div key={a.id} className="flex items-center gap-2.5">
                  <div
                    className={`h-6 w-6 rounded-md ${config.bg} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`h-3 w-3 ${config.text}`} />
                  </div>
                  <p className="text-[13px] text-foreground/80 truncate flex-1">
                    {a.description}
                  </p>
                  <span className="text-[11px] text-muted-foreground/50 shrink-0">
                    {relativeTime(a.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action bubbles — evenly spaced, bottom border */}
      <div className="px-4 py-3 border-t border-b">
        <div className="grid grid-cols-5">
          <ActionBubble icon={MessageSquare} label="Text" />
          <ActionBubble icon={Phone} label="Call" />
          <ActionBubble icon={Mail} label="Email" />
          <ActionBubble icon={Calendar} label="Book" />
          <ActionBubble icon={MoreHorizontal} label="More" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          type="button"
          onClick={() => setTab("details")}
          className={`flex-1 text-xs font-medium py-2.5 text-center transition-colors relative ${
            tab === "details"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Details
          {tab === "details" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("activity")}
          className={`flex-1 text-xs font-medium py-2.5 text-center transition-colors relative ${
            tab === "activity"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Activity
          {tab === "activity" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
          )}
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "details" ? (
          <ContactPanelDetails contact={contact} />
        ) : (
          <ContactPanelActivity contactId={contactId} />
        )}
      </div>
    </div>
  );
}

function ActionBubble({
  icon: Icon,
  label,
  onClick,
}: {
  icon: any;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 group"
    >
      <div className="h-9 w-9 rounded-full border border-border/50 flex items-center justify-center group-hover:bg-muted group-hover:border-border transition-all">
        <Icon className="h-[15px] w-[15px] text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
        {label}
      </span>
    </button>
  );
}
