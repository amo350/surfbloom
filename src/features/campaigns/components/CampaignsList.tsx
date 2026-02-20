"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightSmall,
  Megaphone,
  MessageSquare,
  Plus,
  Send,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCampaigns } from "../hooks/use-campaigns";
import { CampaignStatusBadge } from "./CampaignStatusBadge";

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CampaignsList({ workspaceId }: { workspaceId?: string }) {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );

  const { data, isLoading } = useCampaigns({
    workspaceId,
    status,
    page,
    pageSize: 20,
  });

  const basePath = workspaceId
    ? `/workspaces/${workspaceId}/campaigns`
    : "/index/campaigns";

  const STATUS_FILTERS = [
    { value: undefined, label: "All" },
    { value: "draft", label: "Drafts" },
    { value: "scheduled", label: "Scheduled" },
    { value: "sending", label: "Sending" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => {
                setStatus(f.value);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                status === f.value
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <Button size="sm" asChild>
          <Link href={`${basePath}/new`}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Campaign
          </Link>
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_120px_100px_80px_80px_80px_80px_100px] px-4 py-2 bg-muted/30 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          <span>Campaign</span>
          <span>Status</span>
          <span>Location</span>
          <span className="text-center">Recipients</span>
          <span className="text-center">Sent</span>
          <span className="text-center">Delivered</span>
          <span className="text-center">Replied</span>
          <span className="text-right">Created</span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-5 w-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && data?.items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Megaphone className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No campaigns yet
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Send your first SMS campaign to reach your contacts
            </p>
            <Button size="sm" className="mt-4" asChild>
              <Link href={`${basePath}/new`}>
                <Plus className="h-4 w-4 mr-1.5" />
                Create Campaign
              </Link>
            </Button>
          </div>
        )}

        {/* Rows */}
        {data?.items.map((item: any) => {
          const isGroup = item.type === "group";
          const deliveryRate =
            item.sentCount > 0
              ? Math.round((item.deliveredCount / item.sentCount) * 100)
              : 0;
          const replyRate =
            item.sentCount > 0
              ? Math.round((item.repliedCount / item.sentCount) * 100)
              : 0;
          const href = isGroup
            ? `${basePath}/group/${item.id}`
            : `${basePath}/${item.id}`;

          return (
            <div key={item.id} className="border-t">
              <Link
                href={href}
                className="grid grid-cols-[1fr_120px_100px_80px_80px_80px_80px_100px] px-4 py-3 hover:bg-muted/20 transition-colors items-center"
              >
                {/* Name + preview */}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate flex items-center gap-1.5">
                    {isGroup && (
                      <Megaphone className="h-3.5 w-3.5 text-teal-600" />
                    )}
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {isGroup
                      ? `${item.campaignCount} location campaign${item.campaignCount !== 1 ? "s" : ""}`
                      : `${(item.messageTemplate ?? "").slice(0, 60)}${(item.messageTemplate ?? "").length > 60 ? "..." : ""}`}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <CampaignStatusBadge status={item.status} />
                </div>

                {/* Location */}
                <span className="text-xs text-muted-foreground truncate">
                  {isGroup ? "Multiple" : item.workspace?.name || "—"}
                </span>

                {/* Recipients */}
                <div className="flex items-center justify-center gap-1">
                  <Users className="h-3 w-3 text-muted-foreground/50" />
                  <span className="text-xs">{item.totalRecipients}</span>
                </div>

                {/* Sent */}
                <div className="flex items-center justify-center gap-1">
                  <Send className="h-3 w-3 text-muted-foreground/50" />
                  <span className="text-xs">{item.sentCount}</span>
                </div>

                {/* Delivered */}
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500/50" />
                  <span className="text-xs">
                    {item.deliveredCount}
                    {deliveryRate > 0 && (
                      <span className="text-muted-foreground/50 ml-0.5">
                        {deliveryRate}%
                      </span>
                    )}
                  </span>
                </div>

                {/* Replied */}
                <div className="flex items-center justify-center gap-1">
                  <MessageSquare className="h-3 w-3 text-blue-500/50" />
                  <span className="text-xs">
                    {item.repliedCount}
                    {replyRate > 0 && (
                      <span className="text-muted-foreground/50 ml-0.5">
                        {replyRate}%
                      </span>
                    )}
                  </span>
                </div>

                {/* Created */}
                <span className="text-xs text-muted-foreground text-right">
                  {formatDate(item.createdAt)}
                </span>
              </Link>
              {isGroup && item.campaigns?.length > 0 && (
                <div className="px-4 pb-3">
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    onClick={() =>
                      setExpandedGroups((prev) => ({
                        ...prev,
                        [item.id]: !prev[item.id],
                      }))
                    }
                  >
                    {expandedGroups[item.id] ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRightSmall className="h-3.5 w-3.5" />
                    )}
                    {expandedGroups[item.id] ? "Hide" : "Show"} locations
                  </button>
                  {expandedGroups[item.id] && (
                    <div className="mt-2 space-y-1">
                      {item.campaigns.map((campaign: any) => (
                        <Link
                          key={campaign.id}
                          href={`${basePath}/${campaign.id}`}
                          className="flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted/30"
                        >
                          <span className="truncate">
                            {campaign.workspace?.name}
                          </span>
                          <CampaignStatusBadge status={campaign.status} />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {data.totalCount} campaign{data.totalCount !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {page} / {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
