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
import { Textarea } from "@/components/ui/textarea";

interface SendSmsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: { messageBody: string }) => void;
  defaultValues?: { messageBody?: string };
}

export function SendSmsDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: SendSmsDialogProps) {
  const [body, setBody] = useState(defaultValues?.messageBody || "");

  useEffect(() => {
    if (open) setBody(defaultValues?.messageBody || "");
  }, [open, defaultValues]);

  const handleSave = () => {
    onSubmit({ messageBody: body });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send SMS</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Message body</Label>
            <Textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Hi {{contact.firstName}}, thanks for visiting!"
              rows={4}
              className="text-sm"
            />
            <p className="text-[10px] text-muted-foreground">
              {body.length}/160 characters (1 SMS segment)
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground">
              Template variables:
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              <code className="text-[10px]">{"{{contact.firstName}}"}</code>
              <code className="text-[10px]">{"{{contact.lastName}}"}</code>
              <code className="text-[10px]">{"{{contact.phone}}"}</code>
              <code className="text-[10px]">{"{{location_name}}"}</code>
              <code className="text-[10px]">{"{{location_phone}}"}</code>
              <code className="text-[10px]">{"{{review.rating}}"}</code>
              <code className="text-[10px]">{"{{aiOutput}}"}</code>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button size="sm" onClick={handleSave} disabled={!body.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
