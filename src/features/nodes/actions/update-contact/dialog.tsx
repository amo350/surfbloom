"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { useCategories } from "@/features/contacts/hooks/use-contacts";
import { useStages } from "@/features/contacts/hooks/use-contacts";
import { TokenPicker } from "@/features/nodes/components/TokenPicker";
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
  workspaceId?: string;
  onSubmit: (values: UpdateContactDialogValues) => void;
  defaultValues?: UpdateContactDialogDefaults;
}

export function UpdateContactDialog({
  open,
  onOpenChange,
  workspaceId,
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
  const [categorySearch, setCategorySearch] = useState(
    defaultValues?.categoryName || "",
  );
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);
  const { data: categories, isLoading: categoriesLoading } = useCategories(
    workspaceId,
    categorySearch || undefined,
  );
  const { data: stages, isLoading: stagesLoading } = useStages();

  useEffect(() => {
    if (!open) return;
    setAction(defaultValues?.action || "update_stage");
    setStage(defaultValues?.stage || "");
    setCategoryName(defaultValues?.categoryName || "");
    setCategorySearch(defaultValues?.categoryName || "");
    setNoteTemplate(defaultValues?.noteTemplate || "");
    setAssigneeId(defaultValues?.assigneeId || "");
  }, [open, defaultValues]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!categoryMenuRef.current) return;
      if (!categoryMenuRef.current.contains(event.target as Node)) {
        setCategoryMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    if (action !== "add_category" && action !== "remove_category") {
      setCategoryMenuOpen(false);
    }
  }, [action]);

  const matchedCategory = (categories || []).find(
    (category) =>
      category.name.trim().toLowerCase() === categorySearch.trim().toLowerCase(),
  );
  const resolvedCategoryName = categoryName || matchedCategory?.name || "";

  const handleSave = () => {
    onSubmit({
      action,
      stage: action === "update_stage" ? stage.trim() || undefined : undefined,
      categoryName:
        action === "add_category" || action === "remove_category"
          ? resolvedCategoryName.trim() || undefined
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
    (action === "add_category" && Boolean(resolvedCategoryName.trim())) ||
    (action === "remove_category" && Boolean(resolvedCategoryName.trim())) ||
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
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger id="update-contact-stage" className="h-9">
                  <SelectValue
                    placeholder={stagesLoading ? "Loading stages..." : "Select stage"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(stages || []).map((stageOption: any) => (
                    <SelectItem key={stageOption.slug} value={stageOption.slug}>
                      {stageOption.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">Uses your live stage list</p>
            </div>
          )}

          {(action === "add_category" || action === "remove_category") && (
            <div className="space-y-1.5">
              <Label htmlFor="update-contact-category-name" className="text-xs">
                Category name
              </Label>
              <div className="relative" ref={categoryMenuRef}>
                <Input
                  id="update-contact-category-name"
                  value={categorySearch}
                  onFocus={() => setCategoryMenuOpen(true)}
                  onChange={(e) => {
                    setCategorySearch(e.target.value);
                    setCategoryName("");
                    setCategoryMenuOpen(true);
                  }}
                  placeholder="Search categories..."
                  className="h-9"
                />
                {categoryMenuOpen && (
                  <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-20 rounded-lg border bg-popover shadow-md overflow-hidden">
                    <div className="max-h-48 overflow-y-auto">
                      {categoriesLoading ? (
                        <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Loading categories...
                        </div>
                      ) : (categories || []).length > 0 ? (
                        (categories || []).map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                              setCategoryName(category.name);
                              setCategorySearch(category.name);
                              setCategoryMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted/50 transition-colors"
                          >
                            {category.name}
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-xs text-muted-foreground">
                          No categories found
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Select an existing category
              </p>
            </div>
          )}

          {action === "log_note" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="update-contact-note" className="text-xs">
                  Note
                </Label>
                <TokenPicker
                  onInsert={(token) => setNoteTemplate((prev) => prev + token)}
                />
              </div>
              <Textarea
                id="update-contact-note"
                value={noteTemplate}
                onChange={(e) => setNoteTemplate(e.target.value)}
                placeholder="Review received: {review_rating} stars - {review_text}"
                rows={3}
                className="text-sm"
              />
              <p className="text-[10px] text-muted-foreground">
                Supports {"{variables}"} from workflow context
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
