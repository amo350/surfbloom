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
import { TokenPicker } from "@/features/nodes/components/TokenPicker";

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
            <div className="flex items-center justify-between">
              <Label className="text-xs">Subject</Label>
              <TokenPicker onInsert={(token) => setSubject((prev) => prev + token)} />
            </div>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Thanks for visiting, {first_name}!"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Body (HTML supported)</Label>
              <TokenPicker onInsert={(token) => setHtmlBody((prev) => prev + token)} />
            </div>
            <Textarea
              value={htmlBody}
              onChange={(e) => setHtmlBody(e.target.value)}
              placeholder="<p>Hi {first_name},</p><p>We'd love your feedback on {location_name}...</p>"
              rows={8}
              className="text-sm font-mono"
            />
          </div>
          <div className="rounded-lg bg-muted/30 border p-3 space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground">
              Workflow context (advanced):
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              <code className="text-[10px]">{"{{contact.firstName}}"}</code>
              <code className="text-[10px]">{"{{contact.email}}"}</code>
              <code className="text-[10px]">{"{{workspace.name}}"}</code>
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
