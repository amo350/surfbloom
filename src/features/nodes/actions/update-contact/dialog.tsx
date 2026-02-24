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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  ContactAction,
  UpdateContactDialogDefaults,
} from "./types";

interface UpdateContactDialogValues {
  action: ContactAction;
  stage?: string;
  categoryName?: string;
  noteTemplate?: string;
  assigneeId?: string;
}

interface UpdateContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UpdateContactDialogValues) => void;
  defaultValues?: UpdateContactDialogDefaults;
}

export function UpdateContactDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: UpdateContactDialogProps) {
  const [action, setAction] = useState<ContactAction>(
    defaultValues?.action || "update_stage",
  );
  const [stage, setStage] = useState(defaultValues?.stage || "");
  const [categoryName, setCategoryName] = useState(
    defaultValues?.categoryName || "",
  );
  const [noteTemplate, setNoteTemplate] = useState(
    defaultValues?.noteTemplate || "",
  );
  const [assigneeId, setAssigneeId] = useState(defaultValues?.assigneeId || "");

  useEffect(() => {
    if (!open) return;
    setAction(defaultValues?.action || "update_stage");
    setStage(defaultValues?.stage || "");
    setCategoryName(defaultValues?.categoryName || "");
    setNoteTemplate(defaultValues?.noteTemplate || "");
    setAssigneeId(defaultValues?.assigneeId || "");
  }, [open, defaultValues]);

  const handleSave = () => {
    onSubmit({
      action,
      stage: action === "update_stage" ? stage.trim() || undefined : undefined,
      categoryName:
        action === "add_category" || action === "remove_category"
          ? categoryName.trim() || undefined
          : undefined,
      noteTemplate:
        action === "log_note" ? noteTemplate.trim() || undefined : undefined,
      assigneeId:
        action === "assign_contact" ? assigneeId.trim() || undefined : undefined,
    });
    onOpenChange(false);
  };

  const isValid =
    (action === "update_stage" && Boolean(stage.trim())) ||
    (action === "add_category" && Boolean(categoryName.trim())) ||
    (action === "remove_category" && Boolean(categoryName.trim())) ||
    (action === "log_note" && Boolean(noteTemplate.trim())) ||
    (action === "assign_contact" && Boolean(assigneeId.trim()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Contact</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="update-contact-action" className="text-xs">
              Action
            </Label>
            <Select
              value={action}
              onValueChange={(value) => setAction(value as ContactAction)}
            >
              <SelectTrigger id="update-contact-action" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="update_stage">Update Stage</SelectItem>
                <SelectItem value="add_category">Add Category</SelectItem>
                <SelectItem value="remove_category">Remove Category</SelectItem>
                <SelectItem value="log_note">Log Note</SelectItem>
                <SelectItem value="assign_contact">Assign Contact</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {action === "update_stage" && (
            <div className="space-y-1.5">
              <Label htmlFor="update-contact-stage" className="text-xs">
                Target stage
              </Label>
              <Input
                id="update-contact-stage"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                placeholder="e.g. appointment, active_customer, at_risk"
                className="h-9"
              />
              <p className="text-[10px] text-muted-foreground">
                Must match a stage slug in the workspace
              </p>
            </div>
          )}

          {(action === "add_category" || action === "remove_category") && (
            <div className="space-y-1.5">
              <Label htmlFor="update-contact-category-name" className="text-xs">
                Category name
              </Label>
              <Input
                id="update-contact-category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. promoter, no-show, vip"
                className="h-9"
              />
              {action === "add_category" && (
                <p className="text-[10px] text-muted-foreground">
                  Will be created if it doesn&apos;t exist yet
                </p>
              )}
            </div>
          )}

          {action === "log_note" && (
            <div className="space-y-1.5">
              <Label htmlFor="update-contact-note" className="text-xs">
                Note
              </Label>
              <Textarea
                id="update-contact-note"
                value={noteTemplate}
                onChange={(e) => setNoteTemplate(e.target.value)}
                placeholder="Review received: {{review.rating}} stars - {{review.text}}"
                rows={3}
                className="text-sm"
              />
              <p className="text-[10px] text-muted-foreground">
                Supports {"{{variables}}"} from workflow context
              </p>
            </div>
          )}

          {action === "assign_contact" && (
            <div className="space-y-1.5">
              <Label htmlFor="update-contact-assignee-id" className="text-xs">
                Assignee member ID
              </Label>
              <Input
                id="update-contact-assignee-id"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                placeholder="Member ID"
                className="h-9"
              />
              <p className="text-[10px] text-muted-foreground">
                Future: dropdown of workspace members
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button size="sm" onClick={handleSave} disabled={!isValid}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
