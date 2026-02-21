"use client";

import { useState, useEffect } from "react";
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
import { TEMPLATE_CATEGORIES } from "../server/library-templates";
import { TOKENS, previewTemplate } from "../lib/tokens";
import { useCreateTemplate, useUpdateTemplate } from "../hooks/use-templates";

export function TemplateDialog({
  open,
  onOpenChange,
  template,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: {
    id: string;
    name: string;
    category: string;
    body: string;
    subject?: string | null;
    isLibrary?: boolean;
  } | null;
}) {
  const isEditing = !!template;
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("custom");
  const [body, setBody] = useState("");
  const [subject, setSubject] = useState("");

  useEffect(() => {
    if (open) {
      if (template) {
        setName(template.name);
        setCategory(template.category);
        setBody(template.body);
        setSubject(template.subject || "");
      } else {
        setName("");
        setCategory("custom");
        setBody("");
        setSubject("");
      }
    }
  }, [open, template]);

  const handleInsertToken = (key: string) => {
    setBody((prev) => prev + `{${key}}`);
  };

  const handleSave = () => {
    if (!name.trim() || !body.trim()) {
      toast.error("Name and message body are required");
      return;
    }

    if (isEditing && template) {
      updateTemplate.mutate(
        {
          id: template.id,
          name: name.trim(),
          category,
          body: body.trim(),
          subject: subject.trim() || null,
        },
        {
          onSuccess: () => {
            toast.success("Template updated");
            onOpenChange(false);
          },
          onError: (err) => toast.error(err?.message || "Failed to update"),
        },
      );
    } else {
      createTemplate.mutate(
        {
          name: name.trim(),
          category,
          body: body.trim(),
          subject: subject.trim() || undefined,
        },
        {
          onSuccess: () => {
            toast.success("Template created");
            onOpenChange(false);
          },
          onError: (err) => toast.error(err?.message || "Failed to create"),
        },
      );
    }
  };

  const isPending = createTemplate.isPending || updateTemplate.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Template" : "New Template"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Template Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer Review Request"
              className="h-9"
              autoFocus
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject (future email) */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Subject Line{" "}
              <span className="text-muted-foreground/50">
                (for future email)
              </span>
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Optional — used for email campaigns"
              className="h-9"
            />
          </div>

          {/* Body */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Message Body
            </label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hey {first_name}, thanks for visiting {location_name}..."
              rows={5}
              className="resize-none text-sm"
            />
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">
                {body.length}/1600 characters
              </p>
              {body.length > 160 && (
                <p className="text-[10px] text-amber-600">
                  {Math.ceil(body.length / 160)} SMS segments
                </p>
              )}
            </div>
          </div>

          {/* Token pills */}
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-muted-foreground">
              Insert Tokens
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TOKENS.map((token) => (
                <button
                  key={token.key}
                  type="button"
                  onClick={() => handleInsertToken(token.key)}
                  className="px-2 py-0.5 rounded-md border text-[10px] font-mono text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  {`{${token.key}}`}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {body.trim() && (
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground">
                Preview
              </label>
              <div className="rounded-lg border bg-slate-50 p-3">
                <div className="bg-white rounded-2xl rounded-bl-md px-3 py-2 shadow-sm border max-w-xs">
                  <p className="text-sm whitespace-pre-wrap">
                    {previewTemplate(body)}
                  </p>
                </div>
              </div>
            </div>
          )}

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
              disabled={isPending || !name.trim() || !body.trim()}
            >
              {isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              )}
              {isEditing ? "Save Changes" : "Create Template"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}