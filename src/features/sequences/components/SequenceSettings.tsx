"use client";

import { Loader2, Settings2, Users, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStages } from "@/features/contacts/hooks/use-contacts";
import { useUpdateSequence } from "../hooks/use-sequences";

interface SequenceSettingsProps {
  sequence: any;
  categories?: { id: string; name: string }[];
  keywords?: { keyword: string }[];
}

export function SequenceSettings({
  sequence,
  categories = [],
  keywords = [],
}: SequenceSettingsProps) {
  const { data: stages } = useStages();
  const [audienceType, setAudienceType] = useState(
    sequence.audienceType || "all",
  );
  const [audienceStage, setAudienceStage] = useState(
    sequence.audienceStage || "",
  );
  const [audienceCategoryId, setAudienceCategoryId] = useState(
    sequence.audienceCategoryId || "",
  );
  const [audienceInactiveDays, setAudienceInactiveDays] = useState(
    sequence.audienceInactiveDays?.toString() || "30",
  );
  const [frequencyCapDays, setFrequencyCapDays] = useState(
    sequence.frequencyCapDays?.toString() || "",
  );
  const [triggerType, setTriggerType] = useState(
    sequence.triggerType || "manual",
  );
  const [triggerValue, setTriggerValue] = useState(sequence.triggerValue || "");

  const updateSequence = useUpdateSequence();
  const isActive = sequence.status === "active";

  const handleSave = () => {
    updateSequence.mutate(
      {
        id: sequence.id,
        audienceType: audienceType as any,
        audienceStage: audienceType === "stage" ? audienceStage : null,
        audienceCategoryId:
          audienceType === "category" ? audienceCategoryId : null,
        audienceInactiveDays:
          audienceType === "inactive"
            ? parseInt(audienceInactiveDays, 10) || 30
            : null,
        frequencyCapDays: frequencyCapDays
          ? parseInt(frequencyCapDays, 10)
          : null,
        triggerType: triggerType as any,
        triggerValue:
          triggerType === "keyword_join" || triggerType === "stage_change"
            ? triggerValue
            : null,
      },
      {
        onSuccess: () => toast.success("Settings saved"),
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  return (
    <div className="space-y-5 border rounded-lg p-4 bg-white">
      <div className="flex items-center gap-2">
        <Settings2 className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Sequence Settings</h3>
        {isActive && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-100 text-amber-700 ml-auto">
            Pause to edit
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <label className="text-xs font-medium">Audience Filter</label>
        </div>

        <Select
          value={audienceType}
          onValueChange={setAudienceType}
          disabled={isActive}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All contacts</SelectItem>
            <SelectItem value="stage">By stage</SelectItem>
            <SelectItem value="category">By category</SelectItem>
            <SelectItem value="inactive">Inactive contacts</SelectItem>
          </SelectContent>
        </Select>

        {audienceType === "stage" && (
          <Select
            value={audienceStage}
            onValueChange={setAudienceStage}
            disabled={isActive}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              {(stages || []).map((s: any) => (
                <SelectItem key={s.id} value={s.slug}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {audienceType === "category" && (
          <Select
            value={audienceCategoryId}
            onValueChange={setAudienceCategoryId}
            disabled={isActive}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {audienceType === "inactive" && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={audienceInactiveDays}
              onChange={(e) => setAudienceInactiveDays(e.target.value)}
              className="h-9 w-20"
              min={7}
              max={365}
              disabled={isActive}
            />
            <span className="text-xs text-muted-foreground">days inactive</span>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Frequency Cap (optional)
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={frequencyCapDays}
            onChange={(e) => setFrequencyCapDays(e.target.value)}
            placeholder="e.g. 90"
            className="h-9 w-20"
            min={1}
            max={365}
            disabled={isActive}
          />
          <span className="text-xs text-muted-foreground">
            days between re-enrollment
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-muted-foreground" />
          <label className="text-xs font-medium">Enrollment Trigger</label>
        </div>

        <Select
          value={triggerType}
          onValueChange={setTriggerType}
          disabled={isActive}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual enrollment</SelectItem>
            <SelectItem value="contact_created">New contact created</SelectItem>
            <SelectItem value="keyword_join">Keyword join</SelectItem>
            <SelectItem value="stage_change">Stage change</SelectItem>
          </SelectContent>
        </Select>

        {triggerType === "keyword_join" && (
          <Select
            value={triggerValue}
            onValueChange={setTriggerValue}
            disabled={isActive}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select keyword" />
            </SelectTrigger>
            <SelectContent>
              {keywords.map((k) => (
                <SelectItem key={k.keyword} value={k.keyword}>
                  {k.keyword}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {triggerType === "stage_change" && (
          <Select
            value={triggerValue}
            onValueChange={setTriggerValue}
            disabled={isActive}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select target stage" />
            </SelectTrigger>
            <SelectContent>
              {(stages || []).map((s: any) => (
                <SelectItem key={s.id} value={s.slug}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <p className="text-[10px] text-muted-foreground">
          {triggerType === "manual" &&
            "Enroll contacts manually or via bulk actions from the contacts list."}
          {triggerType === "contact_created" &&
            "Automatically enrolls every new contact that matches the audience filter."}
          {triggerType === "keyword_join" &&
            "Enrolls contacts when they text a keyword to join."}
          {triggerType === "stage_change" &&
            "Enrolls contacts when their stage changes to the selected value."}
        </p>
      </div>

      {!isActive && (
        <Button
          size="sm"
          onClick={handleSave}
          disabled={updateSequence.isPending}
          className="w-full"
        >
          {updateSequence.isPending && (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
          )}
          Save Settings
        </Button>
      )}
    </div>
  );
}
