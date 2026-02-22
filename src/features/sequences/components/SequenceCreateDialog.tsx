"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { useCreateSequence } from "../hooks/use-sequences";

interface SequenceCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  basePath: string;
}

export function SequenceCreateDialog({
  open,
  onOpenChange,
  workspaceId,
  basePath,
}: SequenceCreateDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState<
    "manual" | "contact_created" | "keyword_join" | "stage_change"
  >("manual");

  const createSequence = useCreateSequence();
  const router = useRouter();

  const handleCreate = () => {
    if (!workspaceId) {
      toast.error("Select a workspace to create a sequence");
      return;
    }

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    createSequence.mutate(
      {
        workspaceId,
        name: name.trim(),
        description: description.trim() || undefined,
        triggerType,
      },
      {
        onSuccess: (sequence) => {
          toast.success("Sequence created");
          onOpenChange(false);
          setName("");
          setDescription("");
          setTriggerType("manual");
          router.push(`${basePath}/campaigns/sequences/${sequence.id}`);
        },
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>New Drip Sequence</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Name</p>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Welcome Series, Review Follow-Up"
              className="h-9"
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Description (optional)
            </p>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this sequence do?"
              rows={3}
              className="resize-none text-sm"
              maxLength={500}
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Enrollment Trigger
            </p>
            <Select value={triggerType} onValueChange={(v: any) => setTriggerType(v)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select trigger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual - enroll contacts yourself</SelectItem>
                <SelectItem value="contact_created">
                  Auto - new contact created
                </SelectItem>
                <SelectItem value="keyword_join">
                  Auto - keyword text-to-join
                </SelectItem>
                <SelectItem value="stage_change">
                  Auto - contact stage changes
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              You can update trigger settings later in sequence settings.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={createSequence.isPending}>
              {createSequence.isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Create Sequence
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
