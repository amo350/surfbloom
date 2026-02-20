"use client";

import { useState } from "react";
import { Loader2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCreateSegment } from "../hooks/use-segments";

const AUDIENCE_LABELS: Record<string, string> = {
  all: "All contacts",
  stage: "By stage",
  category: "By category",
  inactive: "Inactive contacts",
};

export function SaveSegmentDialog({
  audienceType,
  audienceStage,
  audienceCategoryId,
  audienceInactiveDays,
  frequencyCapDays,
  disabled,
}: {
  audienceType: string;
  audienceStage?: string;
  audienceCategoryId?: string;
  audienceInactiveDays?: string;
  frequencyCapDays?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const createSegment = useCreateSegment();

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Segment name is required");
      return;
    }

    createSegment.mutate(
      {
        name: name.trim(),
        audienceType,
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
      },
      {
        onSuccess: () => {
          toast.success("Segment saved");
          setName("");
          setOpen(false);
        },
        onError: (err) => toast.error(err?.message || "Failed to save"),
      },
    );
  };

  // Build description
  const parts: string[] = [AUDIENCE_LABELS[audienceType] || audienceType];
  if (audienceType === "stage" && audienceStage) {
    parts.push(`stage: ${audienceStage}`);
  }
  if (audienceType === "inactive" && audienceInactiveDays) {
    parts.push(`inactive ${audienceInactiveDays}+ days`);
  }
  if (frequencyCapDays) {
    parts.push(`${frequencyCapDays}d frequency cap`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          disabled={disabled}
          className="text-xs text-muted-foreground"
        >
          <Bookmark className="h-3 w-3 mr-1" />
          Save Segment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Save Audience Segment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Summary */}
          <div className="rounded-lg border bg-muted/10 px-3 py-2">
            <p className="text-xs text-muted-foreground">{parts.join(" · ")}</p>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Segment Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Recent visitors no review"
              className="h-9"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={createSegment.isPending || !name.trim()}
            >
              {createSegment.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              )}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
