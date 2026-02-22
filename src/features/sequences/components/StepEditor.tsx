"use client";

import { Clock, GitBranch, Loader2, Mail, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAddStep, useUpdateStep } from "../hooks/use-sequences";
import { formatDelay } from "./SequenceTimeline";

const DELAY_PRESETS = [
  { value: 0, label: "Immediately" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 180, label: "3 hours" },
  { value: 360, label: "6 hours" },
  { value: 720, label: "12 hours" },
  { value: 1440, label: "1 day" },
  { value: 2880, label: "2 days" },
  { value: 4320, label: "3 days" },
  { value: 10080, label: "7 days" },
  { value: 20160, label: "14 days" },
  { value: 43200, label: "30 days" },
];

const TOKENS = [
  { key: "first_name", label: "{first_name}" },
  { key: "last_name", label: "{last_name}" },
  { key: "full_name", label: "{full_name}" },
  { key: "location_name", label: "{location_name}" },
  { key: "location_phone", label: "{location_phone}" },
];

interface StepEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sequenceId: string;
  editStep?: any;
}

export function StepEditor({
  open,
  onOpenChange,
  sequenceId,
  editStep,
}: StepEditorProps) {
  const [channel, setChannel] = useState<"sms" | "email">("sms");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [delayMinutes, setDelayMinutes] = useState(1440);
  const [customDelay, setCustomDelay] = useState(false);
  const [customDelayValue, setCustomDelayValue] = useState("");
  const [customDelayUnit, setCustomDelayUnit] = useState<
    "minutes" | "hours" | "days"
  >("hours");
  const [conditionType, setConditionType] = useState("none");
  const [conditionAction, setConditionAction] = useState("continue");
  const [sendWindowStart, setSendWindowStart] = useState("");
  const [sendWindowEnd, setSendWindowEnd] = useState("");
  const [enableSendWindow, setEnableSendWindow] = useState(false);

  const addStep = useAddStep();
  const updateStep = useUpdateStep();
  const isEditing = !!editStep;
  const isPending = addStep.isPending || updateStep.isPending;

  useEffect(() => {
    if (open && editStep) {
      const resolvedEditDelay = editStep.delayMinutes ?? 1440;
      setChannel(editStep.channel || "sms");
      setSubject(editStep.subject || "");
      setBody(editStep.body || "");
      setDelayMinutes(resolvedEditDelay);
      setConditionType(editStep.conditionType || "none");
      setConditionAction(editStep.conditionAction || "continue");
      setSendWindowStart(editStep.sendWindowStart || "");
      setSendWindowEnd(editStep.sendWindowEnd || "");
      setEnableSendWindow(
        !!(editStep.sendWindowStart && editStep.sendWindowEnd),
      );

      const isPreset = DELAY_PRESETS.some((p) => p.value === resolvedEditDelay);
      setCustomDelay(!isPreset);
      if (!isPreset) {
        if (resolvedEditDelay % 1440 === 0) {
          setCustomDelayValue(String(resolvedEditDelay / 1440));
          setCustomDelayUnit("days");
        } else if (resolvedEditDelay % 60 === 0) {
          setCustomDelayValue(String(resolvedEditDelay / 60));
          setCustomDelayUnit("hours");
        } else {
          setCustomDelayValue(String(resolvedEditDelay));
          setCustomDelayUnit("minutes");
        }
      }
    } else if (open) {
      setChannel("sms");
      setSubject("");
      setBody("");
      setDelayMinutes(1440);
      setCustomDelay(false);
      setCustomDelayValue("");
      setCustomDelayUnit("hours");
      setConditionType("none");
      setConditionAction("continue");
      setSendWindowStart("");
      setSendWindowEnd("");
      setEnableSendWindow(false);
    }
  }, [open, editStep]);

  const resolvedDelay = customDelay
    ? Math.max(
        0,
        Math.min(
          525600,
          parseInt(customDelayValue || "0", 10) *
            (customDelayUnit === "days"
              ? 1440
              : customDelayUnit === "hours"
                ? 60
                : 1),
        ),
      )
    : delayMinutes;

  const handleInsertToken = (key: string) => {
    setBody((prev) => prev + `{${key}}`);
  };

  const handleSave = () => {
    if (!body.trim()) {
      toast.error("Message body is required");
      return;
    }
    if (channel === "email" && !subject.trim()) {
      toast.error("Email subject is required");
      return;
    }
    if (enableSendWindow && (!sendWindowStart || !sendWindowEnd)) {
      toast.error("Select both send window start and end times");
      return;
    }

    const basePayload = {
      channel,
      body: body.trim(),
      delayMinutes: resolvedDelay,
      conditionType: conditionType as any,
      conditionAction: conditionAction as any,
    };

    if (isEditing) {
      updateStep.mutate(
        {
          id: editStep.id,
          ...basePayload,
          subject: channel === "email" ? subject.trim() : null,
          sendWindowStart: enableSendWindow ? sendWindowStart : null,
          sendWindowEnd: enableSendWindow ? sendWindowEnd : null,
        },
        {
          onSuccess: () => {
            toast.success("Step updated");
            onOpenChange(false);
          },
          onError: (err) => toast.error(err?.message || "Failed"),
        },
      );
    } else {
      addStep.mutate(
        {
          sequenceId,
          ...basePayload,
          subject: channel === "email" ? subject.trim() : undefined,
          sendWindowStart: enableSendWindow ? sendWindowStart : undefined,
          sendWindowEnd: enableSendWindow ? sendWindowEnd : undefined,
        },
        {
          onSuccess: () => {
            toast.success("Step added");
            onOpenChange(false);
          },
          onError: (err) => toast.error(err?.message || "Failed"),
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit Step ${editStep.order}` : "Add Step"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-5 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Channel
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setChannel("sms")}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors ${
                  channel === "sms"
                    ? "border-teal-300 bg-teal-50/50"
                    : "border-border hover:bg-muted/30"
                }`}
              >
                <MessageSquare
                  className={`h-4 w-4 ${
                    channel === "sms"
                      ? "text-teal-600"
                      : "text-muted-foreground"
                  }`}
                />
                <span className="text-sm font-medium">SMS</span>
              </button>
              <button
                type="button"
                onClick={() => setChannel("email")}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors ${
                  channel === "email"
                    ? "border-blue-300 bg-blue-50/50"
                    : "border-border hover:bg-muted/30"
                }`}
              >
                <Mail
                  className={`h-4 w-4 ${
                    channel === "email"
                      ? "text-blue-600"
                      : "text-muted-foreground"
                  }`}
                />
                <span className="text-sm font-medium">Email</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Wait before sending
            </label>

            {!customDelay ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {DELAY_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setDelayMinutes(preset.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        delayMinutes === preset.value
                          ? "bg-slate-900 text-white"
                          : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setCustomDelay(true)}
                  className="text-[10px] text-teal-600 hover:text-teal-700 font-medium"
                >
                  Custom delay
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={customDelayValue}
                  onChange={(e) => setCustomDelayValue(e.target.value)}
                  placeholder="e.g. 4"
                  className="h-9 w-24"
                  min={0}
                />
                <Select
                  value={customDelayUnit}
                  onValueChange={(v: any) => setCustomDelayUnit(v)}
                >
                  <SelectTrigger className="h-9 w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => {
                    setCustomDelay(false);
                    setDelayMinutes(1440);
                  }}
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Presets
                </button>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground">
              {resolvedDelay === 0
                ? "Sends immediately after previous step"
                : `Sends ${formatDelay(resolvedDelay)} after previous step`}
            </p>
          </div>

          {channel === "email" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Subject Line
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Following up on your visit to {location_name}"
                className="h-9"
                maxLength={200}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {channel === "email" ? "Email Body (HTML)" : "Message"}
            </label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={
                channel === "email"
                  ? "<p>Hi {first_name},</p>\n<p>Just following up...</p>"
                  : "Hi {first_name}, just checking in..."
              }
              rows={channel === "email" ? 8 : 4}
              className={`resize-none text-sm ${channel === "email" ? "font-mono" : ""}`}
            />
            <div className="flex flex-wrap gap-1">
              {TOKENS.map((token) => (
                <button
                  key={token.key}
                  type="button"
                  onClick={() => handleInsertToken(token.key)}
                  className="px-1.5 py-0.5 rounded border text-[9px] font-mono text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  {token.label}
                </button>
              ))}
            </div>
            {channel === "sms" && (
              <p className="text-[10px] text-muted-foreground">
                {body.length}/320 characters
              </p>
            )}
          </div>

          <div className="space-y-2 border rounded-lg p-3 bg-muted/5">
            <div className="flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5 text-amber-500" />
              <label className="text-xs font-medium">
                Condition (optional)
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">
                  Check if contact has...
                </label>
                <Select value={conditionType} onValueChange={setConditionType}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No condition</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="clicked">Clicked a link</SelectItem>
                    <SelectItem value="no_reply">Not replied</SelectItem>
                    <SelectItem value="opted_out">Opted out</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {conditionType !== "none" && (
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground">
                    Then...
                  </label>
                  <Select
                    value={conditionAction}
                    onValueChange={setConditionAction}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="continue">
                        Continue to this step
                      </SelectItem>
                      <SelectItem value="skip">Skip this step</SelectItem>
                      <SelectItem value="stop">Stop sequence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {conditionType !== "none" && (
              <p className="text-[10px] text-muted-foreground">
                {conditionType === "replied" &&
                  conditionAction === "stop" &&
                  "If the contact replied to a previous step, stop the sequence (e.g. they already engaged)."}
                {conditionType === "no_reply" &&
                  conditionAction === "continue" &&
                  "Only send this step if the contact hasn't replied yet."}
                {conditionType === "opted_out" &&
                  conditionAction === "stop" &&
                  "Automatically stops if the contact unsubscribed."}
                {conditionType === "clicked" &&
                  conditionAction === "skip" &&
                  "Skip this step if the contact already clicked a link (they don't need the reminder)."}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setEnableSendWindow(!enableSendWindow)}
              className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                enableSendWindow
                  ? "border-teal-300 bg-teal-50/50"
                  : "border-border hover:bg-muted/30"
              }`}
            >
              <div
                className={`h-4 w-8 rounded-full transition-colors relative ${
                  enableSendWindow ? "bg-teal-500" : "bg-muted-foreground/20"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${
                    enableSendWindow ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>
              <div>
                <p className="text-xs font-medium">Send Window</p>
                <p className="text-[10px] text-muted-foreground">
                  Only send during specific hours
                </p>
              </div>
            </button>

            {enableSendWindow && (
              <div className="flex items-center gap-2 pl-3">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="time"
                  value={sendWindowStart}
                  onChange={(e) => setSendWindowStart(e.target.value)}
                  className="h-8 w-28 text-xs"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  type="time"
                  value={sendWindowEnd}
                  onChange={(e) => setSendWindowEnd(e.target.value)}
                  className="h-8 w-28 text-xs"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-[10px] text-muted-foreground">
            Delay:{" "}
            {resolvedDelay === 0 ? "Immediate" : formatDelay(resolvedDelay)}
            {conditionType !== "none" && ` · Condition: ${conditionType}`}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={
                isPending ||
                !body.trim() ||
                (channel === "email" && !subject.trim())
              }
            >
              {isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              )}
              {isEditing ? "Save Changes" : "Add Step"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
