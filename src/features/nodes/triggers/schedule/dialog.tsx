"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScheduleValues {
  frequency?: string;
  hour?: number;
  minute?: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
}

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ScheduleValues) => void;
  defaultValues?: ScheduleValues;
}

const DAYS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

export function ScheduleDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: ScheduleDialogProps) {
  const defaultsRef = useRef(defaultValues);
  const lastAppliedDefaultsRef = useRef<ScheduleValues | null>(null);

  const [frequency, setFrequency] = useState(defaultValues?.frequency || "daily");
  const [hour, setHour] = useState(defaultValues?.hour?.toString() || "9");
  const [minute, setMinute] = useState(defaultValues?.minute?.toString() || "0");
  const [dayOfWeek, setDayOfWeek] = useState(
    defaultValues?.dayOfWeek?.toString() || "1",
  );
  const [dayOfMonth, setDayOfMonth] = useState(
    defaultValues?.dayOfMonth?.toString() || "1",
  );

  useEffect(() => {
    defaultsRef.current = defaultValues;
  }, [defaultValues]);

  useEffect(() => {
    if (!open) return;

    const incomingDefaults: ScheduleValues = {
      frequency: defaultsRef.current?.frequency,
      hour: defaultsRef.current?.hour,
      minute: defaultsRef.current?.minute,
      dayOfWeek: defaultsRef.current?.dayOfWeek,
      dayOfMonth: defaultsRef.current?.dayOfMonth,
    };

    const lastApplied = lastAppliedDefaultsRef.current;
    const hasChanged =
      !lastApplied ||
      lastApplied.frequency !== incomingDefaults.frequency ||
      lastApplied.hour !== incomingDefaults.hour ||
      lastApplied.minute !== incomingDefaults.minute ||
      lastApplied.dayOfWeek !== incomingDefaults.dayOfWeek ||
      lastApplied.dayOfMonth !== incomingDefaults.dayOfMonth;

    if (!hasChanged) return;

    setFrequency(incomingDefaults.frequency || "daily");
    setHour(incomingDefaults.hour?.toString() || "9");
    setMinute(incomingDefaults.minute?.toString() || "0");
    setDayOfWeek(incomingDefaults.dayOfWeek?.toString() || "1");
    setDayOfMonth(incomingDefaults.dayOfMonth?.toString() || "1");
    lastAppliedDefaultsRef.current = incomingDefaults;
  }, [open]);

  const handleSave = () => {
    onSubmit({
      frequency,
      hour: parseInt(hour, 10),
      minute: parseInt(minute, 10),
      dayOfWeek: frequency === "weekly" ? parseInt(dayOfWeek, 10) : undefined,
      dayOfMonth:
        frequency === "monthly" ? parseInt(dayOfMonth, 10) : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Schedule Trigger</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Hour (UTC)</Label>
              <Select value={hour} onValueChange={setHour}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {String(i).padStart(2, "0")}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Minute</Label>
              <Select value={minute} onValueChange={setMinute}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 15, 30, 45].map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      :{String(m).padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {frequency === "weekly" && (
            <div className="space-y-1.5">
              <Label className="text-xs">Day of week</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {frequency === "monthly" && (
            <div className="space-y-1.5">
              <Label className="text-xs">Day of month</Label>
              <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground">
              Available context variables:
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              <code className="text-[10px]">{"{{schedule.firedAt}}"}</code>
              <code className="text-[10px]">{"{{schedule.frequency}}"}</code>
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
