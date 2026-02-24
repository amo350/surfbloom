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
import { Textarea } from "@/components/ui/textarea";

interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: { subject: string; htmlBody: string }) => void;
  defaultValues?: { subject?: string; htmlBody?: string };
}

export function SendEmailDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: SendEmailDialogProps) {
  const [subject, setSubject] = useState(defaultValues?.subject || "");
  const [htmlBody, setHtmlBody] = useState(defaultValues?.htmlBody || "");
  const wasOpenRef = useRef(false);

  useEffect(() => {
    const isOpening = open && !wasOpenRef.current;
    if (isOpening) {
      setSubject(defaultValues?.subject || "");
      setHtmlBody(defaultValues?.htmlBody || "");
    }
    wasOpenRef.current = open;
  }, [open, defaultValues?.subject, defaultValues?.htmlBody]);

  const handleSave = () => {
    onSubmit({ subject, htmlBody });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Thanks for visiting, {{contact.firstName}}!"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Body (HTML supported)</Label>
            <Textarea
              value={htmlBody}
              onChange={(e) => setHtmlBody(e.target.value)}
              placeholder="<p>Hi {{contact.firstName}},</p><p>We'd love your feedback...</p>"
              rows={8}
              className="text-sm font-mono"
            />
          </div>
          <div className="rounded-lg bg-muted/30 border p-3 space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground">
              Template variables:
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              <code className="text-[10px]">{"{{contact.firstName}}"}</code>
              <code className="text-[10px]">{"{{contact.email}}"}</code>
              <code className="text-[10px]">{"{{location_name}}"}</code>
              <code className="text-[10px]">{"{{aiOutput}}"}</code>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!subject.trim() || !htmlBody.trim()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
