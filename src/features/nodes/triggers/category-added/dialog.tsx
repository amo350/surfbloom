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

interface CategoryAddedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: { categoryName?: string }) => void;
  defaultValues?: { categoryName?: string };
}

export function CategoryAddedDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: CategoryAddedDialogProps) {
  const [categoryName, setCategoryName] = useState(
    defaultValues?.categoryName || "",
  );

  useEffect(() => {
    if (open) {
      setCategoryName(defaultValues?.categoryName || "");
    }
  }, [open, defaultValues]);

  const handleSave = () => {
    onSubmit({ categoryName: categoryName.trim() || undefined });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Category Added Trigger</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="category-added-name" className="text-xs">
              Category name (optional)
            </Label>
            <Input
              id="category-added-name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. no-show, promoter, vip"
              className="h-9"
            />
            <p className="text-[10px] text-muted-foreground">
              Leave empty to trigger on any category. Enter a specific name to
              only fire when that category is added.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground">
              Available context variables:
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              <code className="text-[10px]">{"{{category.name}}"}</code>
              <code className="text-[10px]">{"{{category.id}}"}</code>
              <code className="text-[10px]">{"{{contact.id}}"}</code>
              <code className="text-[10px]">{"{{contactId}}"}</code>
              <code className="text-[10px]">{"{{workspaceId}}"}</code>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
