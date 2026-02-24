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
import { TokenPicker } from "@/features/nodes/components/TokenPicker";

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
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLTextAreaElement>(null);

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

  const insertIntoTitle = (token: string) => {
    const input = titleInputRef.current;
    if (!input) {
      setTitle((prev) => prev + token);
      return;
    }
    const start = input.selectionStart ?? title.length;
    const end = input.selectionEnd ?? title.length;
    const next = `${title.slice(0, start)}${token}${title.slice(end)}`;
    setTitle(next);
    requestAnimationFrame(() => {
      input.focus();
      const caret = start + token.length;
      input.setSelectionRange(caret, caret);
    });
  };

  const insertIntoDescription = (token: string) => {
    const input = descInputRef.current;
    if (!input) {
      setDesc((prev) => prev + token);
      return;
    }
    const start = input.selectionStart ?? desc.length;
    const end = input.selectionEnd ?? desc.length;
    const next = `${desc.slice(0, start)}${token}${desc.slice(end)}`;
    setDesc(next);
    requestAnimationFrame(() => {
      input.focus();
      const caret = start + token.length;
      input.setSelectionRange(caret, caret);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Title</Label>
              <TokenPicker onInsert={insertIntoTitle} />
            </div>
            <Input
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Follow up: {first_name}"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Description (optional)</Label>
              <TokenPicker onInsert={insertIntoDescription} />
            </div>
            <Textarea
              ref={descInputRef}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="{ai_output}"
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
              Workflow context (advanced): {"{{contact.firstName}}"},{" "}
              {"{{review.rating}}"}, {"{{aiOutput}}"}
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
