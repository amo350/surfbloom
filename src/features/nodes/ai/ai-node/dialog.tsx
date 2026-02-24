// biome-ignore-all assist/source/organizeImports: preserve existing import order for this file.
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TokenPicker } from "@/features/nodes/components/TokenPicker";
import { useState, useEffect } from "react";
import { AI_PRESETS, type AiMode } from "../lib/ai-presets";

interface AiNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: {
    mode: string;
    provider: string;
    model?: string;
    presetId?: string;
    systemPrompt?: string;
    userPrompt?: string;
    variableName?: string;
  }) => void;
  defaultValues?: {
    mode?: string;
    provider?: string;
    model?: string;
    presetId?: string;
    systemPrompt?: string;
    userPrompt?: string;
    variableName?: string;
  };
}

const PROVIDERS = [
  {
    value: "anthropic",
    label: "Anthropic (Claude)",
    models: ["claude-sonnet-4-20250514", "claude-haiku-4-5-20251001"],
  },
  { value: "openai", label: "OpenAI (GPT)", models: ["gpt-4o", "gpt-4o-mini"] },
  {
    value: "google",
    label: "Google (Gemini)",
    models: ["gemini-2.0-flash-001", "gemini-2.5-pro"],
  },
  { value: "xai", label: "xAI (Grok)", models: ["grok-3-mini"] },
];

const DEFAULT_MODEL_VALUE = "__default_model__";

export function AiNodeDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: AiNodeDialogProps) {
  const [mode, setMode] = useState<AiMode>(
    (defaultValues?.mode as AiMode) || "generate",
  );
  const [provider, setProvider] = useState(
    defaultValues?.provider || "anthropic",
  );
  const [model, setModel] = useState(defaultValues?.model || "");
  const [presetId, setPresetId] = useState(defaultValues?.presetId || "");
  const [systemPrompt, setSystemPrompt] = useState(
    defaultValues?.systemPrompt || "",
  );
  const [userPrompt, setUserPrompt] = useState(defaultValues?.userPrompt || "");
  const [variableName, setVariableName] = useState(
    defaultValues?.variableName || "aiOutput",
  );

  useEffect(() => {
    if (open) {
      setMode((defaultValues?.mode as AiMode) || "generate");
      setProvider(defaultValues?.provider || "anthropic");
      setModel(defaultValues?.model || "");
      setPresetId(defaultValues?.presetId || "");
      setSystemPrompt(defaultValues?.systemPrompt || "");
      setUserPrompt(defaultValues?.userPrompt || "");
      setVariableName(defaultValues?.variableName || "aiOutput");
    }
  }, [open, defaultValues]);

  // Filter presets by mode
  const modePresets = AI_PRESETS.filter((p) => p.mode === mode);

  // When preset changes, fill in prompts
  const handlePresetChange = (id: string) => {
    setPresetId(id);
    const preset = AI_PRESETS.find((p) => p.id === id);
    if (preset) {
      setSystemPrompt(preset.systemPrompt);
      setUserPrompt(preset.userPromptTemplate);
    }
  };

  // Get models for selected provider
  const providerConfig = PROVIDERS.find((p) => p.value === provider);
  const models = providerConfig?.models || [];

  const handleSave = () => {
    onSubmit({
      mode,
      provider,
      model: model || undefined,
      presetId: presetId || undefined,
      systemPrompt: systemPrompt || undefined,
      userPrompt: userPrompt || undefined,
      variableName: variableName || "aiOutput",
    });
    onOpenChange(false);
  };

  const selectedPreset = AI_PRESETS.find((p) => p.id === presetId);
  const isCustom = selectedPreset?.isCustom || !presetId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Node</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Row 1: Mode + Provider */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Mode</Label>
              <Select
                value={mode}
                onValueChange={(v) => {
                  const currentPreset = AI_PRESETS.find((p) => p.id === presetId);
                  const shouldPreservePrompts = currentPreset?.isCustom === true;
                  setMode(v as AiMode);
                  setPresetId("");
                  if (!shouldPreservePrompts) {
                    setSystemPrompt("");
                    setUserPrompt("");
                  }
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="generate">Generate</SelectItem>
                  <SelectItem value="analyze">Analyze</SelectItem>
                  <SelectItem value="summarize">Summarize</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Provider</Label>
              <Select
                value={provider}
                onValueChange={(v) => {
                  setProvider(v);
                  setModel("");
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Model */}
          {models.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs">Model</Label>
              <Select
                value={model || DEFAULT_MODEL_VALUE}
                onValueChange={(value) =>
                  setModel(value === DEFAULT_MODEL_VALUE ? "" : value)
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DEFAULT_MODEL_VALUE}>Default</SelectItem>
                  {models.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Row 3: Preset */}
          <div className="space-y-1.5">
            <Label className="text-xs">Preset</Label>
            <Select value={presetId} onValueChange={handlePresetChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Choose a preset or write custom" />
              </SelectTrigger>
              <SelectContent>
                {modePresets.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div>
                      <span>{p.label}</span>
                      <span className="ml-2 text-[10px] text-muted-foreground">
                        {p.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Row 4: Custom/Edited Prompts */}
          <div className="space-y-1.5">
            <Label className="text-xs">
              System prompt {!isCustom && "(from preset — editable)"}
            </Label>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are a helpful assistant..."
              rows={3}
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">
                User prompt {!isCustom && "(from preset — editable)"}
              </Label>
              <TokenPicker
                onInsert={(token) => setUserPrompt((prev) => prev + token)}
              />
            </div>
            <Textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Analyze this review: {{review.text}}"
              rows={3}
              className="text-xs font-mono"
            />
          </div>

          {/* Row 5: Output variable */}
          <div className="space-y-1.5">
            <Label className="text-xs">Output variable name</Label>
            <Input
              value={variableName}
              onChange={(e) => setVariableName(e.target.value)}
              placeholder="aiOutput"
              className="h-9 font-mono text-xs"
            />
            <p className="text-[10px] text-muted-foreground">
              Downstream nodes reference this as{" "}
              <code className="bg-muted px-1 rounded">
                {"{{" + (variableName || "aiOutput") + "}}"}
              </code>
            </p>
            {(variableName || "aiOutput") === "aiOutput" && (
              <p className="text-[10px] text-amber-600">
                Tip: If using multiple AI Nodes, give each a unique variable
                name to avoid overwriting previous AI output.
              </p>
            )}
          </div>

          {/* Context variables reference */}
          <div className="rounded-lg bg-muted/30 border p-3 space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground">
              Available in prompts:
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              <code className="text-[10px]">{"{{contact.firstName}}"}</code>
              <code className="text-[10px]">{"{{contact.stage}}"}</code>
              <code className="text-[10px]">{"{{review.rating}}"}</code>
              <code className="text-[10px]">{"{{review.text}}"}</code>
              <code className="text-[10px]">{"{{location_name}}"}</code>
              <code className="text-[10px]">{"{{score}}"}</code>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Brand voice is auto-injected from workspace settings.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
