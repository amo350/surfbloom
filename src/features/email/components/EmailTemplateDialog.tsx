"use client";

import { useState, useEffect } from "react";
import { Loader2, Eye, Code } from "lucide-react";
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
import {
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useEmailCategories,
} from "../hooks/use-email-templates";

const TOKENS = [
  { key: "first_name", label: "First Name" },
  { key: "last_name", label: "Last Name" },
  { key: "full_name", label: "Full Name" },
  { key: "email", label: "Email" },
  { key: "location_name", label: "Location" },
  { key: "location_phone", label: "Phone" },
];

export function EmailTemplateDialog({
  open,
  onOpenChange,
  editTemplate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTemplate?: any;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("custom");
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  const { data: categories } = useEmailCategories();
  const createTemplate = useCreateEmailTemplate();
  const updateTemplate = useUpdateEmailTemplate();

  const isEditing = !!editTemplate;
  const isPending = createTemplate.isPending || updateTemplate.isPending;

  useEffect(() => {
    if (open && editTemplate) {
      setName(editTemplate.name);
      setCategory(editTemplate.category);
      setSubject(editTemplate.subject);
      setHtmlBody(editTemplate.htmlBody);
      setViewMode("edit");
    } else if (open) {
      setName("");
      setCategory("custom");
      setSubject("");
      setHtmlBody("");
      setViewMode("edit");
    }
  }, [open, editTemplate]);

  const handleInsertToken = (key: string) => {
    setHtmlBody((prev) => prev + `{${key}}`);
  };

  const handleInsertSubjectToken = (key: string) => {
    setSubject((prev) => prev + `{${key}}`);
  };

  const handleSave = () => {
    if (!name.trim() || !subject.trim() || !htmlBody.trim()) {
      toast.error("Name, subject, and body are required");
      return;
    }

    if (isEditing) {
      updateTemplate.mutate(
        {
          id: editTemplate.id,
          name: name.trim(),
          category,
          subject: subject.trim(),
          htmlBody: htmlBody.trim(),
        },
        {
          onSuccess: () => {
            toast.success("Template updated");
            onOpenChange(false);
          },
          onError: (err) => toast.error(err?.message || "Failed"),
        },
      );
    } else {
      createTemplate.mutate(
        {
          name: name.trim(),
          category,
          subject: subject.trim(),
          htmlBody: htmlBody.trim(),
        },
        {
          onSuccess: () => {
            toast.success("Template created");
            onOpenChange(false);
          },
          onError: (err) => toast.error(err?.message || "Failed"),
        },
      );
    }
  };

  const previewHtml = htmlBody
    .replace(/\{first_name\}/g, "John")
    .replace(/\{last_name\}/g, "Smith")
    .replace(/\{full_name\}/g, "John Smith")
    .replace(/\{email\}/g, "john@example.com")
    .replace(/\{location_name\}/g, "Joe's Bistro")
    .replace(/\{location_phone\}/g, "(555) 123-4567");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Email Template" : "New Email Template"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-4 py-2">
          {/* Name + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Monthly Newsletter"
                className="h-9"
                maxLength={100}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(categories || []).map((c: any) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Subject Line
              </label>
              <div className="flex gap-1">
                {TOKENS.slice(0, 3).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => handleInsertSubjectToken(t.key)}
                    className="px-1.5 py-0.5 rounded border text-[9px] font-mono text-muted-foreground hover:bg-muted/50 transition-colors"
                  >
                    {`{${t.key}}`}
                  </button>
                ))}
              </div>
            </div>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. How was your experience at {location_name}?"
              className="h-9"
              maxLength={200}
            />
          </div>

          {/* Body — Edit/Preview toggle */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Email Body (HTML)
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode("edit")}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                    viewMode === "edit"
                      ? "bg-slate-900 text-white"
                      : "text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  <Code className="h-2.5 w-2.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                    viewMode === "preview"
                      ? "bg-slate-900 text-white"
                      : "text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  <Eye className="h-2.5 w-2.5" />
                  Preview
                </button>
              </div>
            </div>

            {viewMode === "edit" ? (
              <>
                <Textarea
                  value={htmlBody}
                  onChange={(e) => setHtmlBody(e.target.value)}
                  placeholder="<p>Hi {first_name},</p><p>Your email content here...</p>"
                  rows={12}
                  className="resize-none text-sm font-mono"
                />
                {/* Token pills */}
                <div className="flex flex-wrap gap-1">
                  {TOKENS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => handleInsertToken(t.key)}
                      className="px-2 py-0.5 rounded border text-[10px] font-mono text-muted-foreground hover:bg-muted/50 transition-colors"
                    >
                      {`{${t.key}}`}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/10 px-3 py-1.5 border-b">
                  <p className="text-xs text-muted-foreground">
                    Subject:{" "}
                    <span className="font-medium text-foreground">
                      {subject
                        .replace(/\{first_name\}/g, "John")
                        .replace(/\{location_name\}/g, "Joe's Bistro") ||
                        "(no subject)"}
                    </span>
                  </p>
                </div>
                <div
                  className="p-4 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      previewHtml ||
                      "<p class='text-muted-foreground'>Write some HTML above...</p>",
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-[10px] text-muted-foreground">
            {htmlBody.length.toLocaleString()} characters
          </p>
          <div className="flex gap-2">
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
                isPending || !name.trim() || !subject.trim() || !htmlBody.trim()
              }
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
