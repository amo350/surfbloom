"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Eye,
  Loader2,
  Megaphone,
  MessageSquare,
  Send,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";
import { AppHeader, AppHeaderTitle } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StageBadge } from "@/features/contacts/components/StageBadge";
import {
  useCategories,
  useStages,
} from "@/features/contacts/hooks/use-contacts";
import { useTRPC } from "@/trpc/client";
import {
  useAudiencePreview,
  useCreateCampaign,
  useCreateCampaignGroup,
} from "../hooks/use-campaigns";
import { previewTemplate, TOKENS } from "../lib/tokens";

type Step = 1 | 2 | 3 | 4;

const AUDIENCE_TYPES = [
  {
    value: "all",
    label: "All Contacts",
    description: "Every contact with a phone number",
  },
  {
    value: "stage",
    label: "By Stage",
    description: "Contacts in a specific pipeline stage",
  },
  {
    value: "category",
    label: "By Category",
    description: "Contacts with a specific tag",
  },
  {
    value: "inactive",
    label: "Inactive",
    description: "Contacts not messaged in X days",
  },
];

export function CampaignBuilder({
  workspaceId: workspaceIdProp,
  params,
}: {
  workspaceId?: string;
  params?: Promise<{ workspaceId: string }>;
}) {
  const resolvedParams = params ? use(params) : null;
  const workspaceIdFromParams = resolvedParams?.workspaceId;
  const initialWorkspaceId = workspaceIdProp ?? workspaceIdFromParams;

  const router = useRouter();
  const createCampaign = useCreateCampaign();
  const createCampaignGroup = useCreateCampaignGroup();
  const trpc = useTRPC();

  // Fetch workspaces for index-level builder
  const { data: workspacesData } = useQuery(
    trpc.workspaces.getMany.queryOptions({ page: 1, pageSize: 100 }),
  );

  const [step, setStep] = useState<Step>(1);

  // Step 1: Basics
  const [name, setName] = useState("");
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>(
    initialWorkspaceId ? [initialWorkspaceId] : [],
  );
  const primaryWorkspaceId = selectedWorkspaces[0] || "";

  // Step 2: Audience
  const [audienceType, setAudienceType] = useState("all");
  const [audienceStage, setAudienceStage] = useState("");
  const [audienceCategoryId, setAudienceCategoryId] = useState("");
  const [audienceInactiveDays, setAudienceInactiveDays] = useState("");
  const [frequencyCapDays, setFrequencyCapDays] = useState("");

  // Step 3: Message
  const [messageTemplate, setMessageTemplate] = useState("");

  // Step 4: Schedule
  const [sendType, setSendType] = useState<"now" | "scheduled">("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  // Data
  const { data: stages } = useStages();
  const { data: categories } = useCategories(primaryWorkspaceId);

  const { data: audiencePreview } = useAudiencePreview({
    workspaceId: primaryWorkspaceId,
    audienceType: audienceType as any,
    audienceStage: audienceType === "stage" ? audienceStage : undefined,
    audienceCategoryId:
      audienceType === "category" ? audienceCategoryId : undefined,
    audienceInactiveDays:
      audienceType === "inactive" && audienceInactiveDays
        ? parseInt(audienceInactiveDays)
        : undefined,
    frequencyCapDays: frequencyCapDays ? parseInt(frequencyCapDays) : undefined,
    enabled: !!primaryWorkspaceId && step >= 2,
  });

  const workspaceDetail = workspacesData?.items?.find(
    (ws: any) => ws.id === primaryWorkspaceId,
  );
  const fromLabel =
    workspaceDetail?.phone || workspaceDetail?.name || "your number";

  const basePath =
    workspaceIdProp || workspaceIdFromParams
      ? `/workspaces/${workspaceIdProp || workspaceIdFromParams}/campaigns`
      : "/index/campaigns";

  // Validation
  const canStep2 = name.trim().length > 0 && selectedWorkspaces.length > 0;
  const canStep3 =
    audienceType === "all" ||
    (audienceType === "stage" && audienceStage) ||
    (audienceType === "category" && audienceCategoryId) ||
    (audienceType === "inactive" && audienceInactiveDays);
  const canStep4 = messageTemplate.trim().length > 0;
  const canLaunch = canStep2 && canStep3 && canStep4;

  const handleInsertToken = (key: string) => {
    setMessageTemplate((prev) => prev + `{${key}}`);
  };

  const isCreating = createCampaign.isPending || createCampaignGroup.isPending;

  const handleCreate = async (launch: boolean) => {
    if (!canLaunch) return;

    let scheduledAt: string | undefined;
    if (sendType === "scheduled" && scheduledDate && scheduledTime) {
      scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    }

    const payload = {
      name: name.trim(),
      messageTemplate: messageTemplate.trim(),
      audienceType: audienceType as any,
      audienceStage: audienceType === "stage" ? audienceStage : undefined,
      audienceCategoryId:
        audienceType === "category" ? audienceCategoryId : undefined,
      audienceInactiveDays:
        audienceType === "inactive" && audienceInactiveDays
          ? parseInt(audienceInactiveDays)
          : undefined,
      frequencyCapDays: frequencyCapDays
        ? parseInt(frequencyCapDays)
        : undefined,
      scheduledAt,
    };

    try {
      if (selectedWorkspaces.length === 1) {
        const campaign = await createCampaign.mutateAsync({
          workspaceId: selectedWorkspaces[0],
          ...payload,
        });
        toast.success(
          launch
            ? "Campaign created — review and launch from the detail page"
            : "Campaign saved as draft",
        );
        router.push(`${basePath}/${campaign.id}`);
        return;
      }

      const group = await createCampaignGroup.mutateAsync({
        workspaceIds: selectedWorkspaces,
        ...payload,
      });
      toast.success(
        launch
          ? "Campaign group created — review and launch from the group page"
          : "Campaign group saved as draft",
      );
      router.push(`${basePath}/group/${group.id}`);
    } catch (err: any) {
      toast.error(err?.message || String(err) || "Failed to create campaign");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <AppHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={basePath}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <AppHeaderTitle title="New Campaign" />
        </div>
      </AppHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6">
          {/* Progress steps */}
          <div className="flex items-center gap-2 mb-8">
            {[
              { num: 1, label: "Details", icon: Megaphone },
              { num: 2, label: "Audience", icon: Users },
              { num: 3, label: "Message", icon: MessageSquare },
              { num: 4, label: "Review", icon: Eye },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => {
                    if (s.num <= step) setStep(s.num as Step);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    step === s.num
                      ? "bg-teal-50 text-teal-700 border border-teal-200"
                      : step > s.num
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "text-muted-foreground border border-transparent"
                  }`}
                >
                  {step > s.num ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <s.icon className="h-3 w-3" />
                  )}
                  {s.label}
                </button>
                {i < 3 && (
                  <div
                    className={`flex-1 h-px ${
                      step > s.num ? "bg-emerald-300" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Campaign Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Summer Promo, Review Request Blast"
                  className="h-10"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Internal name — your contacts won't see this
                </p>
              </div>

              {/* Location selector (index level only) */}
              {!workspaceIdProp && !workspaceIdFromParams && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Locations</label>
                  <div className="border rounded-lg divide-y">
                    {workspacesData?.items?.map((ws: any) => {
                      const selected = selectedWorkspaces.includes(ws.id);
                      return (
                        <button
                          key={ws.id}
                          type="button"
                          onClick={() =>
                            setSelectedWorkspaces((prev) =>
                              prev.includes(ws.id)
                                ? prev.filter((id) => id !== ws.id)
                                : [...prev, ws.id],
                            )
                          }
                          className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                        >
                          <span className="text-sm">{ws.name}</span>
                          {selected && (
                            <Check className="h-4 w-4 text-teal-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Choose one for a single campaign, or multiple to create a
                    group
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={() => setStep(2)} disabled={!canStep2}>
                  Audience
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Audience */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Who should receive this?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AUDIENCE_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setAudienceType(t.value)}
                      className={`text-left px-3 py-3 rounded-lg border transition-colors ${
                        audienceType === t.value
                          ? "border-teal-300 bg-teal-50/50"
                          : "border-border hover:bg-muted/30"
                      }`}
                    >
                      <p className="text-sm font-medium">{t.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stage picker */}
              {audienceType === "stage" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Stage</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(stages || []).map((s: any) => (
                      <button
                        key={s.slug}
                        type="button"
                        onClick={() => setAudienceStage(s.slug)}
                        className={`transition-opacity ${
                          audienceStage === s.slug
                            ? "opacity-100"
                            : "opacity-40 hover:opacity-70"
                        }`}
                      >
                        <StageBadge
                          stage={s.slug}
                          name={s.name}
                          color={s.color}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category picker */}
              {audienceType === "category" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={audienceCategoryId}
                    onValueChange={setAudienceCategoryId}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(categories || []).map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Inactive days */}
              {audienceType === "inactive" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Inactive for how many days?
                  </label>
                  <Input
                    type="number"
                    value={audienceInactiveDays}
                    onChange={(e) => setAudienceInactiveDays(e.target.value)}
                    placeholder="e.g. 30"
                    className="h-9 w-32"
                    min={1}
                  />
                </div>
              )}

              {/* Frequency cap */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Frequency Cap{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={frequencyCapDays}
                    onChange={(e) => setFrequencyCapDays(e.target.value)}
                    placeholder="e.g. 7"
                    className="h-9 w-24"
                    min={1}
                  />
                  <span className="text-xs text-muted-foreground">
                    Skip contacts messaged in the last X days
                  </span>
                </div>
              </div>

              {/* Audience preview */}
              {audiencePreview && (
                <div className="rounded-lg border p-4 bg-muted/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-teal-600" />
                    <span className="text-sm font-semibold">
                      {audiencePreview.count} contacts
                    </span>
                    <span className="text-xs text-muted-foreground">
                      will receive this campaign
                    </span>
                  </div>
                  {audiencePreview.count === 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      No contacts match these criteria
                    </div>
                  )}
                  {audiencePreview.sample.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {audiencePreview.sample.map((c: any) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <div className="h-5 w-5 rounded bg-muted flex items-center justify-center text-[9px] font-medium shrink-0">
                            {c.firstName?.[0] || "?"}
                          </div>
                          <span className="truncate">
                            {[c.firstName, c.lastName]
                              .filter(Boolean)
                              .join(" ")}
                          </span>
                          <span className="text-muted-foreground/50">
                            {c.phone}
                          </span>
                        </div>
                      ))}
                      {audiencePreview.count > 5 && (
                        <p className="text-[10px] text-muted-foreground/50 mt-1">
                          and {audiencePreview.count - 5} more...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!canStep3}>
                  Message
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Message */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  placeholder="Hey {first_name}, we've got a special offer at {location_name}..."
                  rows={5}
                  className="resize-none text-sm"
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {messageTemplate.length}/1600 characters
                  </p>
                  {messageTemplate.length > 160 && (
                    <p className="text-[10px] text-amber-600">
                      {Math.ceil(messageTemplate.length / 160)} SMS segments
                    </p>
                  )}
                </div>
              </div>

              {/* Token pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Insert Tokens
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TOKENS.map((token) => (
                    <button
                      key={token.key}
                      type="button"
                      onClick={() => handleInsertToken(token.key)}
                      className="px-2.5 py-1 rounded-md border text-xs font-mono text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                    >
                      {`{${token.key}}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* SMS Preview */}
              {messageTemplate.trim() && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Preview
                  </label>
                  <div className="max-w-xs mx-auto">
                    <div className="rounded-2xl border bg-slate-50 p-4">
                      <div className="flex justify-start">
                        <div className="bg-white rounded-2xl rounded-bl-md px-3.5 py-2.5 shadow-sm border max-w-full">
                          <p className="text-sm whitespace-pre-wrap">
                            {previewTemplate(messageTemplate)}
                          </p>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center mt-2">
                        From: {fromLabel}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Back
                </Button>
                <Button onClick={() => setStep(4)} disabled={!canStep4}>
                  Review
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-4">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Campaign
                  </p>
                  <p className="text-sm font-medium mt-1">{name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {workspaceDetail?.name || "—"}
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Audience
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {audiencePreview?.count || 0} contacts
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                    {audienceType === "all"
                      ? "All contacts"
                      : audienceType === "stage"
                        ? `Stage: ${audienceStage}`
                        : audienceType === "category"
                          ? "By category"
                          : `Inactive ${audienceInactiveDays}+ days`}
                    {frequencyCapDays && ` · ${frequencyCapDays}d cap`}
                  </p>
                </div>

                <div className="rounded-lg border p-4 col-span-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Message Preview
                  </p>
                  <p className="text-sm mt-1.5 whitespace-pre-wrap">
                    {previewTemplate(messageTemplate)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {messageTemplate.length} chars ·{" "}
                    {Math.ceil(messageTemplate.length / 160)} SMS segment
                    {Math.ceil(messageTemplate.length / 160) > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Schedule */}
              <div className="rounded-lg border p-4 space-y-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  When to send
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSendType("now")}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${
                      sendType === "now"
                        ? "border-teal-300 bg-teal-50/50"
                        : "border-border hover:bg-muted/30"
                    }`}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setSendType("scheduled")}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${
                      sendType === "scheduled"
                        ? "border-teal-300 bg-teal-50/50"
                        : "border-border hover:bg-muted/30"
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Schedule
                  </button>
                </div>

                {sendType === "scheduled" && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="h-9 w-40"
                    />
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="h-9 w-32"
                    />
                  </div>
                )}
              </div>

              {/* Warning */}
              {(audiencePreview?.count || 0) > 0 && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 text-amber-700 text-xs">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>
                    This will send {audiencePreview?.count} SMS message
                    {(audiencePreview?.count || 0) > 1 ? "s" : ""} from{" "}
                    {fromLabel}.
                    {sendType === "now"
                      ? " Messages will begin sending immediately."
                      : ` Messages will send on ${scheduledDate} at ${scheduledTime}.`}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4">
                <Button variant="ghost" onClick={() => setStep(3)}>
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleCreate(false)}
                    disabled={isCreating}
                  >
                    Save Draft
                  </Button>
                  <Button
                    onClick={() => handleCreate(true)}
                    disabled={
                      isCreating ||
                      !canLaunch ||
                      (audiencePreview?.count || 0) === 0
                    }
                  >
                    {isCreating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    ) : (
                      <Send className="h-4 w-4 mr-1.5" />
                    )}
                    {sendType === "now"
                      ? "Create & Launch"
                      : "Create & Schedule"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
