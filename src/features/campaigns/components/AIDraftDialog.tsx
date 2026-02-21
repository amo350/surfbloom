"use client";

import { useState } from "react";
import {
  Sparkles,
  Loader2,
  ArrowRight,
  RotateCcw,
  Check,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  useGenerateMessage,
  useImproveMessage,
} from "../hooks/use-campaign-ai";
import { previewTemplate } from "../lib/tokens";

const PRESETS = [
  { value: "review_request", label: "Review Request", emoji: "⭐" },
  { value: "promo", label: "Promotional Offer", emoji: "🏷️" },
  { value: "welcome", label: "Welcome Message", emoji: "👋" },
  { value: "re_engagement", label: "Win Back", emoji: "💌" },
  { value: "appointment_reminder", label: "Appointment Reminder", emoji: "📅" },
  { value: "referral", label: "Referral Ask", emoji: "🤝" },
  { value: "follow_up", label: "Follow-Up", emoji: "✅" },
];

const IMPROVE_OPTIONS = [
  { value: "shorter", label: "Shorter" },
  { value: "casual", label: "More Casual" },
  { value: "professional", label: "More Professional" },
  { value: "urgent", label: "Add Urgency" },
  { value: "friendly", label: "Warmer" },
] as const;

export function AIDraftDialog({
  onAccept,
  businessName,
  businessType,
  currentMessage,
}: {
  onAccept: (message: string) => void;
  businessName?: string;
  businessType?: string;
  currentMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"pick" | "prompt" | "result">("pick");
  const [preset, setPreset] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const generate = useGenerateMessage();
  const improve = useImproveMessage();

  const isLoading = generate.isPending || improve.isPending;

  const handleGenerate = (selectedPreset?: string) => {
    generate.mutate(
      {
        preset: selectedPreset || undefined,
        prompt: customPrompt.trim() || undefined,
        businessName,
        businessType,
      },
      {
        onSuccess: (data) => {
          setGeneratedMessage(data.message);
          setHistory([data.message]);
          setStep("result");
        },
        onError: (err) => toast.error(err?.message || "Generation failed"),
      },
    );
  };

  const handleImprove = (instruction: string) => {
    improve.mutate(
      {
        message: generatedMessage,
        instruction: instruction as any,
      },
      {
        onSuccess: (data) => {
          setHistory((prev) => [...prev, data.message]);
          setGeneratedMessage(data.message);
        },
        onError: (err) => toast.error(err?.message || "Improvement failed"),
      },
    );
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setGeneratedMessage(newHistory[newHistory.length - 1]);
    }
  };

  const handleAccept = () => {
    onAccept(generatedMessage);
    setOpen(false);
    resetState();
  };

  const resetState = () => {
    setStep("pick");
    setPreset(null);
    setCustomPrompt("");
    setGeneratedMessage("");
    setHistory([]);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" type="button">
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          Draft with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            AI Message Draft
          </DialogTitle>
        </DialogHeader>

        {/* ─── Step 1: Pick preset ─────────────────────── */}
        {step === "pick" && (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              What kind of message do you want to send?
            </p>

            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    setPreset(p.value);
                    handleGenerate(p.value);
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left hover:bg-muted/30 transition-colors disabled:opacity-50"
                >
                  <span className="text-base">{p.emoji}</span>
                  <span className="text-sm font-medium">{p.label}</span>
                </button>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Or describe what you want
              </p>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Ask customers to try our new weekend brunch menu, mention the 15% discount for first-timers"
                rows={3}
                className="resize-none text-sm"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => handleGenerate()}
                  disabled={isLoading || !customPrompt.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Generate
                </Button>
              </div>
            </div>

            {/* Improve existing message */}
            {currentMessage?.trim() && (
              <div className="border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => {
                    setGeneratedMessage(currentMessage);
                    setHistory([currentMessage]);
                    setStep("result");
                  }}
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Improve my current message instead
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ─── Step 2: Result + improve ────────────────── */}
        {step === "result" && (
          <div className="space-y-4 mt-2">
            {/* Loading overlay */}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                <span className="text-sm text-muted-foreground ml-2">
                  {generate.isPending ? "Drafting..." : "Improving..."}
                </span>
              </div>
            )}

            {/* Preview */}
            {!isLoading && (
              <>
                <div className="rounded-xl border bg-slate-50 p-4">
                  <div className="bg-white rounded-2xl rounded-bl-md px-3.5 py-2.5 shadow-sm border max-w-xs">
                    <p className="text-sm whitespace-pre-wrap">
                      {previewTemplate(generatedMessage)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground">
                    {generatedMessage.length} chars ·{" "}
                    {Math.ceil(generatedMessage.length / 160)} SMS segment
                    {Math.ceil(generatedMessage.length / 160) > 1 ? "s" : ""}
                  </p>
                  {history.length > 1 && (
                    <button
                      type="button"
                      onClick={handleUndo}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <RotateCcw className="h-2.5 w-2.5" />
                      Undo
                    </button>
                  )}
                </div>

                {/* Improve pills */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Improve
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {IMPROVE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleImprove(opt.value)}
                        disabled={isLoading}
                        className="px-2.5 py-1 rounded-lg border text-xs font-medium text-muted-foreground hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 transition-colors disabled:opacity-50"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      resetState();
                      setStep("pick");
                    }}
                  >
                    Start Over
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleAccept}>
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      Use This Message
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
