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
import { Textarea } from "@/components/ui/textarea";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: {
    titleTemplate: string;
    descriptionTemplate?: string;
    priority?: string;
    dueDateOffset?: number;
  }) => void;
  defaultValues?: {
    titleTemplate?: string;
    descriptionTemplate?: string;
    priority?: string;
    dueDateOffset?: number;
  };
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: CreateTaskDialogProps) {
  const [title, setTitle] = useState(defaultValues?.titleTemplate || "");
  const [desc, setDesc] = useState(defaultValues?.descriptionTemplate || "");
  const [priority, setPriority] = useState(defaultValues?.priority || "medium");
  const [dueOffset, setDueOffset] = useState(
    defaultValues?.dueDateOffset?.toString() || "",
  );

  useEffect(() => {
    if (open) {
      setTitle(defaultValues?.titleTemplate || "");
      setDesc(defaultValues?.descriptionTemplate || "");
      setPriority(defaultValues?.priority || "medium");
      setDueOffset(defaultValues?.dueDateOffset?.toString() || "");
    }
  }, [open, defaultValues]);

  const handleSave = () => {
    const trimmedOffset = dueOffset.trim();
    const parsedOffset = trimmedOffset ? Number.parseInt(trimmedOffset, 10) : NaN;

    onSubmit({
      titleTemplate: title,
      descriptionTemplate: desc || undefined,
      priority,
      dueDateOffset:
        trimmedOffset && Number.isFinite(parsedOffset) && Number.isInteger(parsedOffset)
          ? parsedOffset
          : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Follow up: {{contact.firstName}}"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description (optional)</Label>
            <Textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="{{aiOutput}}"
              rows={3}
              className="text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Due in (hours)</Label>
              <Input
                type="number"
                min={0}
                value={dueOffset}
                onChange={(e) => setDueOffset(e.target.value)}
                placeholder="e.g. 24"
                className="h-9"
              />
            </div>
          </div>
          <div className="rounded-lg bg-muted/30 border p-3 space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground">
              Variables: {"{{contact.firstName}}"}, {"{{review.rating}}"},{" "}
              {"{{aiOutput}}"}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button size="sm" onClick={handleSave} disabled={!title.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
