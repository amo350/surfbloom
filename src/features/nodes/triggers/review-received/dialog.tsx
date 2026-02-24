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
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [minRating, setMinRating] = useState(
    defaultValues?.minRating?.toString() || "",
  );
  const [maxRating, setMaxRating] = useState(
    defaultValues?.maxRating?.toString() || "",
  );

  useEffect(() => {
    if (open) {
      setRangeError(null);
      setMinRating(defaultValues?.minRating?.toString() || "");
      setMaxRating(defaultValues?.maxRating?.toString() || "");
    }
  }, [open, defaultValues]);

  const handleSave = () => {
    const parsedMin = minRating.trim() ? Number(minRating) : undefined;
    const parsedMax = maxRating.trim() ? Number(maxRating) : undefined;
    const normalizedMin =
      parsedMin != null && Number.isFinite(parsedMin)
        ? Math.max(1, Math.min(5, parsedMin))
        : undefined;
    const normalizedMax =
      parsedMax != null && Number.isFinite(parsedMax)
        ? Math.max(1, Math.min(5, parsedMax))
        : undefined;

    if (
      normalizedMin != null &&
      normalizedMax != null &&
      normalizedMin > normalizedMax
    ) {
      setRangeError("Min rating must be less than or equal to max rating.");
      return;
    }

    onSubmit({
      minRating: normalizedMin,
      maxRating: normalizedMax,
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
              <Label htmlFor="review-received-min-rating" className="text-xs">
                Min rating (1-5)
              </Label>
              <Input
                id="review-received-min-rating"
                type="number"
                min={1}
                max={5}
                value={minRating}
                onChange={(e) => {
                  setRangeError(null);
                  setMinRating(e.target.value);
                }}
                placeholder="1"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="review-received-max-rating" className="text-xs">
                Max rating (1-5)
              </Label>
              <Input
                id="review-received-max-rating"
                type="number"
                min={1}
                max={5}
                value={maxRating}
                onChange={(e) => {
                  setRangeError(null);
                  setMaxRating(e.target.value);
                }}
                placeholder="5"
                className="h-9"
              />
            </div>
          </div>
          {rangeError && (
            <p className="text-[10px] text-destructive">{rangeError}</p>
          )}

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
