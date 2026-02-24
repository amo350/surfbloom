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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type WaitUnit = "minutes" | "hours" | "days";

interface WaitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: { amount: number; unit: WaitUnit }) => void;
  defaultValues?: {
    amount?: number;
    unit?: WaitUnit;
  };
}

export function WaitDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: WaitDialogProps) {
  const [amount, setAmount] = useState(
    defaultValues?.amount?.toString() || "1",
  );
  const [unit, setUnit] = useState<WaitUnit>(defaultValues?.unit || "hours");

  useEffect(() => {
    if (open) {
      setAmount(defaultValues?.amount?.toString() || "1");
      setUnit(defaultValues?.unit || "hours");
    }
  }, [open, defaultValues]);

  const handleSave = () => {
    const parsed = Math.max(1, parseInt(amount, 10) || 1);
    onSubmit({ amount: parsed, unit });
    onOpenChange(false);
  };

  const parsedAmount = Math.max(1, parseInt(amount, 10) || 1);
  let durationNote = "";

  if (unit === "minutes" && parsedAmount >= 60) {
    durationNote = `= ${(parsedAmount / 60).toFixed(1)} hours`;
  } else if (unit === "hours" && parsedAmount >= 24) {
    durationNote = `= ${(parsedAmount / 24).toFixed(1)} days`;
  } else if (unit === "days" && parsedAmount >= 7) {
    durationNote = `= ${(parsedAmount / 7).toFixed(1)} weeks`;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Wait</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs">Duration</Label>
              <Input
                type="number"
                min={1}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="h-9"
              />
            </div>
            <div className="w-28 space-y-1.5">
              <Label className="text-xs">Unit</Label>
              <Select
                value={unit}
                onValueChange={(value) => setUnit(value as WaitUnit)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {durationNote && (
            <p className="text-[10px] text-muted-foreground">{durationNote}</p>
          )}

          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-[10px] text-muted-foreground">
              The workflow pauses for this duration, then continues to the next
              node. Uses Inngest durable sleep.
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
