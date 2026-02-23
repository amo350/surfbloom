"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCreateSurvey } from "../hooks/use-surveys";

interface SurveyCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SurveyCreateDialog({
  open,
  onOpenChange,
}: SurveyCreateDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const createSurvey = useCreateSurvey();
  const router = useRouter();

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    createSurvey.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
      },
      {
        onSuccess: (survey) => {
          toast.success("Survey created");
          onOpenChange(false);
          setName("");
          setDescription("");
          router.push(`/index/surveys/${survey.id}`);
        },
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Survey</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Post-Visit Experience, Customer Satisfaction"
              className="h-9"
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Description (optional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this survey for?"
              rows={2}
              className="resize-none text-sm"
              maxLength={500}
            />
          </div>

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
              onClick={handleCreate}
              disabled={createSurvey.isPending || !name.trim()}
            >
              {createSurvey.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              )}
              Create Survey
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
