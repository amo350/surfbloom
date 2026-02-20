"use client";

import { useState } from "react";
import { Users, Check, Trash2, Loader2, Bookmark } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSegments, useDeleteSegment } from "../hooks/use-segments";

const AUDIENCE_LABELS: Record<string, string> = {
  all: "All contacts",
  stage: "By stage",
  category: "By category",
  inactive: "Inactive contacts",
};

export function SegmentPicker({
  onSelect,
  selectedId,
}: {
  onSelect: (segment: {
    id: string;
    name: string;
    audienceType: string;
    audienceStage?: string | null;
    audienceCategoryId?: string | null;
    audienceInactiveDays?: number | null;
    frequencyCapDays?: number | null;
  }) => void;
  selectedId?: string;
}) {
  const [open, setOpen] = useState(false);
  const { data: segments, isLoading } = useSegments();
  const deleteSegment = useDeleteSegment();

  const handleSelect = (segment: any) => {
    onSelect({
      id: segment.id,
      name: segment.name,
      audienceType: segment.audienceType,
      audienceStage: segment.audienceStage,
      audienceCategoryId: segment.audienceCategoryId,
      audienceInactiveDays: segment.audienceInactiveDays,
      frequencyCapDays: segment.frequencyCapDays,
    });
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteSegment.mutate(
      { id },
      {
        onSuccess: () => toast.success("Segment deleted"),
        onError: (err) => toast.error(err?.message || "Failed to delete"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" type="button">
          <Bookmark className="h-3.5 w-3.5 mr-1.5" />
          {selectedId ? "Change Segment" : "Saved Segments"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[60vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Saved Segments</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-1.5 py-2">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && (segments?.length || 0) === 0 && (
            <div className="flex flex-col items-center py-8 text-center">
              <Users className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">
                No saved segments
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Configure an audience and click "Save Segment" to reuse it
              </p>
            </div>
          )}

          {segments?.map((segment: any) => {
            const isSelected = segment.id === selectedId;
            return (
              <div
                key={segment.id}
                className={`flex items-center gap-2 rounded-lg border transition-colors ${
                  isSelected
                    ? "border-teal-300 bg-teal-50/50"
                    : "border-border hover:bg-muted/30"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(segment)}
                  className="flex-1 text-left px-3 py-3"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{segment.name}</p>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-teal-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-muted-foreground">
                      {AUDIENCE_LABELS[segment.audienceType] ||
                        segment.audienceType}
                    </span>
                    {segment.audienceType === "stage" &&
                      segment.audienceStage && (
                        <span className="text-[11px] text-muted-foreground/60">
                          · {segment.audienceStage}
                        </span>
                      )}
                    {segment.audienceType === "inactive" &&
                      segment.audienceInactiveDays && (
                        <span className="text-[11px] text-muted-foreground/60">
                          · {segment.audienceInactiveDays}+ days
                        </span>
                      )}
                    {segment.frequencyCapDays && (
                      <span className="text-[11px] text-muted-foreground/60">
                        · {segment.frequencyCapDays}d cap
                      </span>
                    )}
                    {segment._count?.campaigns > 0 && (
                      <span className="text-[10px] text-muted-foreground/40">
                        · {segment._count.campaigns} campaign
                        {segment._count.campaigns !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 mr-2 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete segment?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete "{segment.name}". Campaigns using this
                        segment won't be affected.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(segment.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
