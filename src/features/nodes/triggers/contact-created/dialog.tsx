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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContactCreatedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: { source?: string }) => void;
  defaultValues?: { source?: string };
}

const ANY_SOURCE = "__any_source__";

const SOURCE_OPTIONS = [
  { value: ANY_SOURCE, label: "Any source" },
  { value: "manual", label: "Manual" },
  { value: "csv", label: "CSV import" },
  { value: "webhook", label: "Webhook" },
  { value: "chatbot", label: "Chatbot" },
  { value: "sms", label: "SMS" },
  { value: "feedback", label: "Feedback page" },
  { value: "review_campaign", label: "Review campaign" },
];

export function ContactCreatedDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: ContactCreatedDialogProps) {
  const [source, setSource] = useState(defaultValues?.source || ANY_SOURCE);

  useEffect(() => {
    if (open) {
      setSource(defaultValues?.source || ANY_SOURCE);
    }
  }, [open, defaultValues]);

  const handleSave = () => {
    onSubmit({ source: source === ANY_SOURCE ? undefined : source });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Contact Created Trigger</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="contact-created-source" className="text-xs">
              Filter by source (optional)
            </Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger id="contact-created-source" className="h-9">
                <SelectValue placeholder="Any source" />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              Leave empty to trigger on all new contacts
            </p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground">
              Available context variables:
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              <code className="text-[10px]">{"{{contact.firstName}}"}</code>
              <code className="text-[10px]">{"{{contact.lastName}}"}</code>
              <code className="text-[10px]">{"{{contact.email}}"}</code>
              <code className="text-[10px]">{"{{contact.phone}}"}</code>
              <code className="text-[10px]">{"{{contact.stage}}"}</code>
              <code className="text-[10px]">{"{{contact.source}}"}</code>
              <code className="text-[10px]">{"{{contactId}}"}</code>
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
