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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  useCreateFromTemplate,
  useCreateSurvey,
  useTemplates,
} from "../hooks/use-surveys";

interface SurveyCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detailBasePath: string;
}

export function SurveyCreateDialog({
  open,
  onOpenChange,
  detailBasePath,
}: SurveyCreateDialogProps) {
  const [tab, setTab] = useState<"blank" | "template">("blank");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const createSurvey = useCreateSurvey();
  const createFromTemplate = useCreateFromTemplate();
  const { data: templatesData } = useTemplates();
  const templates: Array<{
    id: string;
    name: string;
    description: string | null;
    questions: unknown;
    createdAt: Date;
  }> = Array.isArray(templatesData) ? templatesData : [];
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
          router.push(`${detailBasePath}/${survey.id}`);
        },
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  const handleCreateFromTemplate = () => {
    if (!selectedTemplateId) {
      toast.error("Select a template");
      return;
    }
    if (!name.trim()) {
      toast.error("Survey name is required");
      return;
    }

    createFromTemplate.mutate(
      {
        templateId: selectedTemplateId,
        name: name.trim(),
      },
      {
        onSuccess: (survey) => {
          toast.success("Survey created from template");
          onOpenChange(false);
          setName("");
          setDescription("");
          setSelectedTemplateId("");
          setTab("blank");
          router.push(`${detailBasePath}/${survey.id}`);
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
          <div className="flex gap-1 p-1 rounded-lg bg-muted/40 border">
            <button
              type="button"
              onClick={() => setTab("blank")}
              className={`flex-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                tab === "blank"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Blank
            </button>
            <button
              type="button"
              onClick={() => setTab("template")}
              className={`flex-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                tab === "template"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              From Template
            </button>
          </div>

          {tab === "blank" ? (
            <>
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
            </>
          ) : (
            <div className="space-y-3">
              <Select
                value={selectedTemplateId}
                onValueChange={setSelectedTemplateId}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      No templates yet
                    </SelectItem>
                  ) : (
                    templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} (
                        {Array.isArray(template.questions)
                          ? template.questions.length
                          : 0}{" "}
                        questions)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Survey name..."
                className="h-9"
                maxLength={100}
              />

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateFromTemplate}
                  disabled={
                    createFromTemplate.isPending ||
                    !selectedTemplateId ||
                    !name.trim()
                  }
                >
                  {createFromTemplate.isPending && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  )}
                  Create from Template
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
