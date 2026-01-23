"use client";

import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateGoogleFormScript } from "./utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GoogleFormTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  // construct url webhook
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhose:3000";
  const webhookUrl = `${baseURL}/api/webhooks/google-form?workflowId=${workflowId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Google Form Trigger Configuration</DialogTitle>
          <DialogDescription>
            Use this webhook URL in your Google Form's Apps Script to trigger
            this workflow when a form is submitted
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                value={webhookUrl}
                readOnly
                className="font-mono text-sm truncate"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                <CopyIcon />
              </Button>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Setup instructions</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open your Google Form</li>
              <li>Click the three dots menu → Script editor</li>
              <li>Copy and paste the script below</li>
              <li>Choose: From form → On form submit → Save</li>
            </ol>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <h4 className="font-medium text-sm">Google Apps Script:</h4>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={async () => {
                  const script = generateGoogleFormScript(webhookUrl);
                  try {
                    await navigator.clipboard.writeText(script);
                    toast.success("Copied to clipboard");
                  } catch {
                    toast.error("Failed to copy to clipboard");
                  }
                }}
              >
                <CopyIcon className="size-4 mr-2" />
                Copy Script
              </Button>
              <p className="text-xs text-muted-foreground">
                This script includes your webhook URL and handles form
                submissions
              </p>
            </div>
            <div className="rounded border border-border/50 p-3 space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">
                Available Variables
              </h4>
              <ul className="text-xs text-muted-foreground/80 space-y-1">
                <li>
                  <code className="bg-muted/50 px-1 py-0.5 rounded text-[10px]">
                    {"{{googleForm.respondentEmail}}"}
                  </code>
                  <span className="ml-1.5">- Respondent's Email</span>
                </li>
                <li>
                  <code className="bg-muted/50 px-1 py-0.5 rounded text-[10px]">
                    {"{{googleForm.respondentEmail['Question Name']}}"}
                  </code>
                  <span className="ml-1.5">- Specific answer</span>
                </li>
                <li>
                  <code className="bg-muted/50 px-1 py-0.5 rounded text-[10px]">
                    {"{{json googleForm.responses}}"}
                  </code>
                  <span className="ml-1.5">- All responses as JSON</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
