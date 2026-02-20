"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Users,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Loader2,
  Pause,
  Play,
  Trash2,
  Ban,
  Clock,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { AppHeader, AppHeaderTitle } from "@/components/AppHeader";
import {
  useCampaign,
  useRecipients,
  useLaunchCampaign,
  usePauseCampaign,
  useResumeCampaign,
  useCancelCampaign,
  useDeleteCampaign,
} from "../hooks/use-campaigns";
import { CampaignStatusBadge } from "./CampaignStatusBadge";
import { previewTemplate } from "../lib/tokens";
import { StageBadge } from "@/features/contacts/components/StageBadge";

const RECIPIENT_STATUS_CONFIG: Record<string, { label: string; color: string }> =
  {
  pending: { label: "Pending", color: "text-slate-500" },
  sent: { label: "Sent", color: "text-blue-500" },
  delivered: { label: "Delivered", color: "text-emerald-500" },
  failed: { label: "Failed", color: "text-red-500" },
  replied: { label: "Replied", color: "text-violet-500" },
  opted_out: { label: "Opted Out", color: "text-amber-500" },
  };

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  percentage,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
  percentage?: number;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold">{value}</span>
        {percentage !== undefined && percentage > 0 && (
          <span className="text-xs text-muted-foreground">{percentage}%</span>
        )}
      </div>
    </div>
  );
}

function formatDate(date: string | Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CampaignDetail({
  campaignId,
  workspaceId,
}: {
  campaignId: string;
  workspaceId?: string;
}) {
  const router = useRouter();
  const { data: campaign, isLoading } = useCampaign(campaignId);

  const [recipientStatus, setRecipientStatus] = useState<string | undefined>(
    undefined,
  );
  const [recipientPage, setRecipientPage] = useState(1);
  const { data: recipients } = useRecipients({
    campaignId,
    status: recipientStatus,
    page: recipientPage,
    pageSize: 20,
  });

  const launch = useLaunchCampaign();
  const pause = usePauseCampaign();
  const resume = useResumeCampaign();
  const cancel = useCancelCampaign();
  const deleteCampaign = useDeleteCampaign();

  const basePath = workspaceId
    ? `/workspaces/${workspaceId}/campaigns`
    : "/index/campaigns";

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        Campaign not found
      </div>
    );
  }

  const deliveryRate =
    campaign.sentCount > 0
      ? Math.round((campaign.deliveredCount / campaign.sentCount) * 100)
      : 0;
  const replyRate =
    campaign.sentCount > 0
      ? Math.round((campaign.repliedCount / campaign.sentCount) * 100)
      : 0;
  const failRate =
    campaign.sentCount > 0
      ? Math.round((campaign.failedCount / campaign.sentCount) * 100)
      : 0;

  const canLaunch = ["draft", "scheduled"].includes(campaign.status);
  const canPause = campaign.status === "sending";
  const canResume = campaign.status === "paused";
  const canCancel = ["sending", "paused", "scheduled"].includes(
    campaign.status,
  );
  const canDelete = ["draft", "completed", "cancelled"].includes(
    campaign.status,
  );

  const handleLaunch = () => {
    launch.mutate(
      { id: campaignId },
      { onSuccess: () => toast.success("Campaign launched"), onError: (err) => toast.error(err.message) },
    );
  };

  const handlePause = () => {
    pause.mutate(
      { id: campaignId },
      { onSuccess: () => toast.success("Campaign paused"), onError: (err) => toast.error(err.message) },
    );
  };

  const handleResume = () => {
    resume.mutate(
      { id: campaignId },
      { onSuccess: () => toast.success("Campaign resumed"), onError: (err) => toast.error(err.message) },
    );
  };

  const handleCancel = () => {
    cancel.mutate(
      { id: campaignId },
      { onSuccess: () => toast.success("Campaign cancelled"), onError: (err) => toast.error(err.message) },
    );
  };

  const handleDelete = () => {
    deleteCampaign.mutate(
      { id: campaignId },
      {
        onSuccess: () => {
          toast.success("Campaign deleted");
          router.push(basePath);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <div className="h-full flex flex-col">
      <AppHeader>
        <div className="flex items-center gap-2 flex-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={basePath}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <AppHeaderTitle title={campaign.name} />
            <CampaignStatusBadge status={campaign.status} />
          </div>

          <div className="flex-1" />

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {canLaunch && (
              <Button
                size="sm"
                onClick={handleLaunch}
                disabled={launch.isPending}
              >
                {launch.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                )}
                Launch Now
              </Button>
            )}

            {canPause && (
              <Button
                size="sm"
                variant="outline"
                onClick={handlePause}
                disabled={pause.isPending}
              >
                <Pause className="h-3.5 w-3.5 mr-1.5" />
                Pause
              </Button>
            )}

            {canResume && (
              <Button
                size="sm"
                onClick={handleResume}
                disabled={resume.isPending}
              >
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Resume
              </Button>
            )}

            {canCancel && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={cancel.isPending}
              >
                <Ban className="h-3.5 w-3.5 mr-1.5" />
                Cancel
              </Button>
            )}

            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete campaign?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{campaign.name}" and all
                      recipient data. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </AppHeader>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-5 gap-3">
          <StatCard
            label="Recipients"
            value={campaign.totalRecipients}
            icon={Users}
            color="text-slate-500"
          />
          <StatCard
            label="Sent"
            value={campaign.sentCount}
            icon={Send}
            color="text-blue-500"
          />
          <StatCard
            label="Delivered"
            value={campaign.deliveredCount}
            icon={CheckCircle2}
            color="text-emerald-500"
            percentage={deliveryRate}
          />
          <StatCard
            label="Failed"
            value={campaign.failedCount}
            icon={XCircle}
            color="text-red-500"
            percentage={failRate}
          />
          <StatCard
            label="Replied"
            value={campaign.repliedCount}
            icon={MessageSquare}
            color="text-violet-500"
            percentage={replyRate}
          />
        </div>

        {/* Campaign info */}
        <div className="grid grid-cols-2 gap-4">
          {/* Message preview */}
          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Message
            </p>
            <div className="max-w-xs">
              <div className="rounded-2xl border bg-slate-50 p-3">
                <div className="bg-white rounded-2xl rounded-bl-md px-3 py-2 shadow-sm border">
                  <p className="text-sm whitespace-pre-wrap">
                    {previewTemplate(campaign.messageTemplate)}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {campaign.messageTemplate.length} chars ·{" "}
              {Math.ceil(campaign.messageTemplate.length / 160)} SMS segment
              {Math.ceil(campaign.messageTemplate.length / 160) > 1 ? "s" : ""}
            </p>
          </div>

          {/* Details */}
          <div className="rounded-lg border p-4 space-y-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Details
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">
                  {campaign.workspace?.name || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Audience</span>
                <span className="font-medium capitalize">
                  {campaign.audienceType === "all"
                    ? "All contacts"
                    : campaign.audienceType === "stage"
                      ? `Stage: ${campaign.audienceStage}`
                      : campaign.audienceType === "category"
                        ? "By category"
                        : `Inactive ${campaign.audienceInactiveDays}+ days`}
                </span>
              </div>

              {campaign.frequencyCapDays && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Frequency cap</span>
                  <span className="font-medium">
                    {campaign.frequencyCapDays} days
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created by</span>
                <span className="font-medium">
                  {campaign.createdBy?.name || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="text-xs">{formatDate(campaign.createdAt)}</span>
              </div>

              {campaign.scheduledAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Scheduled
                  </span>
                  <span className="text-xs">
                    {formatDate(campaign.scheduledAt)}
                  </span>
                </div>
              )}

              {campaign.startedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Started</span>
                  <span className="text-xs">
                    {formatDate(campaign.startedAt)}
                  </span>
                </div>
              )}

              {campaign.completedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="text-xs">
                    {formatDate(campaign.completedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recipients table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Recipients</p>
            <div className="flex items-center gap-1">
              {[
                { value: undefined, label: "All" },
                { value: "pending", label: "Pending" },
                { value: "sent", label: "Sent" },
                { value: "delivered", label: "Delivered" },
                { value: "failed", label: "Failed" },
                { value: "replied", label: "Replied" },
              ].map((f) => (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => {
                    setRecipientStatus(f.value);
                    setRecipientPage(1);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${
                    recipientStatus === f.value
                      ? "bg-foreground/10 text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_120px_120px_100px_140px] px-4 py-2 bg-muted/30 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              <span>Contact</span>
              <span>Phone</span>
              <span>Stage</span>
              <span>Status</span>
              <span className="text-right">Timestamp</span>
            </div>

            {/* Empty */}
            {recipients?.items.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                {campaign.status === "draft"
                  ? "Recipients will appear after the campaign is launched"
                  : "No recipients match this filter"}
              </div>
            )}

            {/* Rows */}
            {recipients?.items.map((r: any) => {
              const statusConfig =
                RECIPIENT_STATUS_CONFIG[r.status] ||
                RECIPIENT_STATUS_CONFIG.pending;
              const name = [r.contact?.firstName, r.contact?.lastName]
                .filter(Boolean)
                .join(" ") || "Unknown";
              const timestamp =
                r.repliedAt || r.deliveredAt || r.sentAt || r.failedAt;

              return (
                <div
                  key={r.id}
                  className="grid grid-cols-[1fr_120px_120px_100px_140px] px-4 py-2.5 border-t items-center"
                >
                  {/* Contact */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-6 w-6 rounded bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-white">
                        {r.contact?.firstName?.[0] || "?"}
                      </span>
                    </div>
                    <Link
                      href={`/index/contacts/${r.contactId}`}
                      className="text-sm font-medium truncate hover:underline"
                    >
                      {name}
                    </Link>
                  </div>

                  {/* Phone */}
                  <span className="text-xs text-muted-foreground truncate">
                    {r.contact?.phone || "—"}
                  </span>

                  {/* Stage */}
                  <div>
                    {r.contact?.stage && (
                      <StageBadge stage={r.contact.stage} />
                    )}
                  </div>

                  {/* Status */}
                  <span
                    className={`text-xs font-medium ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                    {r.errorMessage && (
                      <span
                        className="text-red-400 ml-1"
                        title={r.errorMessage}
                      >
                        ⓘ
                      </span>
                    )}
                  </span>

                  {/* Timestamp */}
                  <span className="text-xs text-muted-foreground text-right">
                    {timestamp
                      ? new Date(timestamp).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {recipients && recipients.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {recipients.totalCount} recipient
                {recipients.totalCount !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() =>
                    setRecipientPage((p) => Math.max(1, p - 1))
                  }
                  disabled={recipientPage <= 1}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {recipientPage} / {recipients.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() =>
                    setRecipientPage((p) =>
                      Math.min(recipients.totalPages, p + 1),
                    )
                  }
                  disabled={recipientPage >= recipients.totalPages}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}