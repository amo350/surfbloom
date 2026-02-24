"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReviewReceivedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: { minRating?: number; maxRating?: number }) => void;
  defaultValues?: { minRating?: number; maxRating?: number };
}

export function ReviewReceivedDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: ReviewReceivedDialogProps) {
  const [minRating, setMinRating] = useState(
    defaultValues?.minRating?.toString() || "",
  );
  const [maxRating, setMaxRating] = useState(
    defaultValues?.maxRating?.toString() || "",
  );

  useEffect(() => {
    if (open) {
      setMinRating(defaultValues?.minRating?.toString() || "");
      setMaxRating(defaultValues?.maxRating?.toString() || "");
    }
  }, [open, defaultValues]);

  const handleSave = () => {
    const parsedMin = minRating.trim() ? Number(minRating) : undefined;
    const parsedMax = maxRating.trim() ? Number(maxRating) : undefined;

    onSubmit({
      minRating:
        parsedMin != null && Number.isFinite(parsedMin)
          ? Math.max(1, Math.min(5, parsedMin))
          : undefined,
      maxRating:
        parsedMax != null && Number.isFinite(parsedMax)
          ? Math.max(1, Math.min(5, parsedMax))
          : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Review Received Trigger</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Min rating (1-5)</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                placeholder="1"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Max rating (1-5)</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={maxRating}
                onChange={(e) => setMaxRating(e.target.value)}
                placeholder="5"
                className="h-9"
              />
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground">
            Leave both empty to fire on every new review.
          </p>

          <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground">
              Available context variables:
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              <code className="text-[10px]">{"{{review.rating}}"}</code>
              <code className="text-[10px]">{"{{review.text}}"}</code>
              <code className="text-[10px]">{"{{review.authorName}}"}</code>
              <code className="text-[10px]">{"{{review.id}}"}</code>
              <code className="text-[10px]">{"{{workspaceId}}"}</code>
            </div>
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
