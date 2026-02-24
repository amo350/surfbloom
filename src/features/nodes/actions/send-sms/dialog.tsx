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
  const wasOpenRef = useRef(false);

  useEffect(() => {
    const isOpening = open && !wasOpenRef.current;
    if (isOpening) {
      setBody(defaultValues?.messageBody || "");
    }
    wasOpenRef.current = open;
  }, [open, defaultValues?.messageBody]);

  const handleSave = () => {
    onSubmit({ messageBody: body });
    onOpenChange(false);
  };

  const segments = calculateSmsSegments(body);

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
              {body.length} characters ({segments} SMS segment
              {segments === 1 ? "" : "s"})
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

const GSM_7_BASIC_CHARACTERS = new Set(
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ`¿abcdefghijklmnopqrstuvwxyzäöñüà"
    .split(""),
);

const GSM_7_EXTENDED_CHARACTERS = new Set("^{}\\[~]|€".split(""));

function calculateSmsSegments(message: string): number {
  if (!message) return 0;

  let usesGsm7 = true;
  let gsm7Length = 0;

  for (const char of message) {
    if (GSM_7_BASIC_CHARACTERS.has(char)) {
      gsm7Length += 1;
      continue;
    }
    if (GSM_7_EXTENDED_CHARACTERS.has(char)) {
      gsm7Length += 2;
      continue;
    }
    usesGsm7 = false;
    break;
  }

  if (usesGsm7) {
    if (gsm7Length <= 160) return 1;
    return Math.ceil(gsm7Length / 153);
  }

  const ucs2Length = Array.from(message).length;
  if (ucs2Length <= 70) return 1;
  return Math.ceil(ucs2Length / 67);
}
