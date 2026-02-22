"use client";

import { useEffect, useState } from "react";
import { Loader2, Webhook } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  useCreateWebhookEndpoint,
  useUpdateWebhookEndpoint,
  useWebhookEvents,
} from "../hooks/use-webhooks";

export function WebhookEndpointDialog({
  open,
  onOpenChange,
  workspaceId,
  editEndpoint,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  editEndpoint?: any;
}) {
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const { data: availableEvents } = useWebhookEvents();
  const createEndpoint = useCreateWebhookEndpoint();
  const updateEndpoint = useUpdateWebhookEndpoint();

  const isEditing = !!editEndpoint;
  const isPending = createEndpoint.isPending || updateEndpoint.isPending;

  useEffect(() => {
    if (open && editEndpoint) {
      setUrl(editEndpoint.url);
      setSelectedEvents(editEndpoint.events || []);
    } else if (open) {
      setUrl("");
      setSelectedEvents([]);
    }
  }, [open, editEndpoint]);

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  };

  const toggleAll = () => {
    if (!availableEvents) return;
    if (selectedEvents.length === availableEvents.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(availableEvents.map((e: any) => e.value));
    }
  };

  const handleSave = () => {
    if (!url.trim()) {
      toast.error("URL is required");
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error("Select at least one event");
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error("Enter a valid URL");
      return;
    }

    if (isEditing) {
      updateEndpoint.mutate(
        { id: editEndpoint.id, url: url.trim(), events: selectedEvents as any },
        {
          onSuccess: () => {
            toast.success("Endpoint updated");
            onOpenChange(false);
          },
          onError: (err) => toast.error(err?.message || "Failed"),
        },
      );
    } else {
      createEndpoint.mutate(
        { workspaceId, url: url.trim(), events: selectedEvents as any },
        {
          onSuccess: () => {
            toast.success("Webhook endpoint created");
            onOpenChange(false);
          },
          onError: (err) => toast.error(err?.message || "Failed"),
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Webhook className="h-4 w-4 text-teal-600" />
            {isEditing ? "Edit Webhook" : "New Webhook Endpoint"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Endpoint URL
            </label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              className="h-9 text-sm font-mono"
              maxLength={500}
            />
            <p className="text-[10px] text-muted-foreground">
              We&apos;ll POST a signed JSON payload to this URL
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Events
              </label>
              <button
                type="button"
                onClick={toggleAll}
                className="text-[10px] text-teal-600 hover:text-teal-700 font-medium"
              >
                {selectedEvents.length === (availableEvents?.length || 0)
                  ? "Deselect all"
                  : "Select all"}
              </button>
            </div>
            <div className="space-y-1 max-h-[250px] overflow-y-auto border rounded-lg p-2">
              {(availableEvents || []).map((event: any) => {
                const isSelected = selectedEvents.includes(event.value);
                return (
                  <button
                    key={event.value}
                    type="button"
                    onClick={() => toggleEvent(event.value)}
                    className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-md text-left transition-colors ${
                      isSelected
                        ? "bg-teal-50/50 border border-teal-200"
                        : "hover:bg-muted/30 border border-transparent"
                    }`}
                  >
                    <div
                      className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-teal-500 border-teal-500"
                          : "border-border"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="h-2.5 w-2.5 text-white"
                          viewBox="0 0 12 12"
                        >
                          <path
                            fill="currentColor"
                            d="M10 3L4.5 8.5 2 6"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{event.label}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {event.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {selectedEvents.length} event
              {selectedEvents.length !== 1 ? "s" : ""} selected
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isPending || !url.trim() || selectedEvents.length === 0}
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              {isEditing ? "Save Changes" : "Create Endpoint"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
