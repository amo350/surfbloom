"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useCreateKeyword } from "../hooks/use-keywords";
import { useStages } from "@/features/contacts/hooks/use-contacts";
import { useTRPC } from "@/trpc/client";
import { StageBadge } from "@/features/contacts/components/StageBadge";

export function KeywordDialog({
  open,
  onOpenChange,
  workspaceId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string;
}) {
  const trpc = useTRPC();
  const createKeyword = useCreateKeyword();
  const { data: stages } = useStages();
  const { data: workspacesData } = useQuery(
    trpc.workspaces.getMany.queryOptions({ page: 1, pageSize: 100 }),
  );

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(
    workspaceId || "",
  );
  const [keyword, setKeyword] = useState("");
  const [autoReply, setAutoReply] = useState("");
  const [stage, setStage] = useState("new_lead");

  useEffect(() => {
    if (open) {
      setSelectedWorkspaceId(workspaceId || "");
      setKeyword("");
      setAutoReply("");
      setStage("new_lead");
    }
  }, [open, workspaceId]);

  const handleSave = () => {
    const wsId = workspaceId || selectedWorkspaceId;
    if (!wsId) {
      toast.error("Select a location");
      return;
    }
    if (!keyword.trim()) {
      toast.error("Keyword is required");
      return;
    }
    if (!autoReply.trim()) {
      toast.error("Auto-reply message is required");
      return;
    }

    createKeyword.mutate(
      {
        workspaceId: wsId,
        keyword: keyword.trim(),
        autoReply: autoReply.trim(),
        stage,
      },
      {
        onSuccess: () => {
          toast.success("Keyword created");
          onOpenChange(false);
        },
        onError: (err) => toast.error(err?.message || "Failed to create"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-teal-600" />
            New Text-to-Join Keyword
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Location picker (only at index level) */}
          {!workspaceId &&
            workspacesData?.items &&
            workspacesData.items.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Location
              </label>
              <Select
                value={selectedWorkspaceId}
                onValueChange={setSelectedWorkspaceId}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {workspacesData.items.map((ws: any) => (
                    <SelectItem key={ws.id} value={ws.id}>
                      {ws.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Keyword */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Keyword
            </label>
            <Input
              value={keyword}
              onChange={(e) =>
                setKeyword(
                  e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                )
              }
              placeholder="e.g. DEALS, VIP, JOIN"
              className="h-9 font-mono uppercase"
              maxLength={20}
              autoFocus
            />
            <p className="text-[10px] text-muted-foreground">
              Letters and numbers only, 2-20 characters
            </p>
          </div>

          {/* Auto-reply */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Confirmation Reply
            </label>
            <Textarea
              value={autoReply}
              onChange={(e) => setAutoReply(e.target.value)}
              placeholder="Thanks for signing up! You'll now receive exclusive deals from us. Reply STOP anytime to unsubscribe."
              rows={3}
              className="resize-none text-sm"
            />
            <p className="text-[10px] text-muted-foreground">
              {autoReply.length}/320 · Sent immediately when someone texts your
              keyword
            </p>
          </div>

          {/* Stage */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Assign Stage
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(stages || []).map((s: any) => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => setStage(s.slug)}
                  className={`transition-opacity ${
                    stage === s.slug
                      ? "opacity-100"
                      : "opacity-40 hover:opacity-70"
                  }`}
                >
                  <StageBadge stage={s.slug} />
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border bg-slate-50 p-3">
            <p className="text-[10px] font-medium text-muted-foreground mb-2">
              Preview
            </p>
            <div className="space-y-2">
              <div className="flex justify-end">
                <div className="bg-teal-500 text-white rounded-2xl rounded-br-md px-3 py-1.5 text-sm">
                  {keyword || "KEYWORD"}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md px-3 py-1.5 shadow-sm border text-sm max-w-[250px]">
                  {autoReply || "Your confirmation message..."}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={
                createKeyword.isPending ||
                !keyword.trim() ||
                !autoReply.trim() ||
                (!workspaceId && !selectedWorkspaceId)
              }
            >
              {createKeyword.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              )}
              Create Keyword
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
