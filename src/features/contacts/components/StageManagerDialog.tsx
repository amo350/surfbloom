"use client";

import { useState } from "react";
import {
  Settings2,
  Plus,
  Loader2,
  GripVertical,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  useStages,
  useCreateStage,
  useUpdateStage,
  useDeleteStage,
  useReorderStages,
} from "../hooks/use-contacts";
import { StageBadge } from "./StageBadge";

const COLOR_OPTIONS = [
  "blue",
  "violet",
  "amber",
  "emerald",
  "slate",
  "red",
  "teal",
  "pink",
  "orange",
  "indigo",
];

const COLOR_SWATCHES: Record<string, string> = {
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  slate: "bg-slate-500",
  red: "bg-red-500",
  teal: "bg-teal-500",
  pink: "bg-pink-500",
  orange: "bg-orange-500",
  indigo: "bg-indigo-500",
};

export function StageManagerDialog() {
  const [open, setOpen] = useState(false);
  const { data: stages, isLoading } = useStages();
  const createStage = useCreateStage();
  const updateStage = useUpdateStage();
  const deleteStage = useDeleteStage();
  const reorderStages = useReorderStages();

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("blue");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createStage.mutate(
      { name: newName.trim(), color: newColor },
      {
        onSuccess: () => {
          setNewName("");
          setNewColor("blue");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleUpdate = (id: string) => {
    if (!editName.trim()) return;
    updateStage.mutate(
      { id, name: editName.trim(), color: editColor },
      {
        onSuccess: () => setEditingId(null),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleDelete = (id: string, slug: string) => {
    if (!stages || stages.length <= 3) {
      toast.error("Must have at least 3 stages");
      return;
    }
    const reassignTo = stages.find((s: any) => s.id !== id);
    deleteStage.mutate(
      { id, reassignToSlug: reassignTo?.slug || "new_lead" },
      { onError: (err) => toast.error(err.message) },
    );
  };

  const handleDragEnd = (targetId: string) => {
    if (!dragId || dragId === targetId || !stages) return;

    const ids = stages.map((s: any) => s.id);
    const fromIdx = ids.indexOf(dragId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const reordered = [...ids];
    reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, dragId);

    reorderStages.mutate(
      { stageIds: reordered },
      { onError: (err) => toast.error(err.message) },
    );
    setDragId(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Settings2 className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pipeline Stages</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Stage list */}
          <div className="space-y-1">
            {isLoading && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {stages?.map((stage: any) => (
              <div
                key={stage.id}
                draggable
                onDragStart={() => setDragId(stage.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDragEnd(stage.id)}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg border transition-colors ${
                  dragId === stage.id
                    ? "border-teal-300 bg-teal-50/30"
                    : "border-transparent hover:bg-muted/30"
                }`}
              >
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 cursor-grab shrink-0" />

                {editingId === stage.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-xs flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdate(stage.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <div className="flex gap-0.5">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setEditColor(c)}
                          className={`h-4 w-4 rounded-full ${COLOR_SWATCHES[c]} ${
                            editColor === c
                              ? "ring-2 ring-offset-1 ring-foreground"
                              : ""
                          }`}
                        />
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleUpdate(stage.id)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(stage.id);
                        setEditName(stage.name);
                        setEditColor(stage.color);
                      }}
                      className="flex-1 text-left"
                    >
                      <StageBadge
                        stage={stage.slug}
                        name={stage.name}
                        color={stage.color}
                      />
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(stage.id, stage.slug)}
                      disabled={(stages?.length ?? 0) <= 3}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add new stage */}
          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New stage name..."
                className="h-8 text-sm flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCreate}
                disabled={
                  createStage.isPending ||
                  !newName.trim() ||
                  (stages?.length ?? 0) >= 7
                }
                className="h-8"
              >
                {createStage.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>

            {/* Color picker for new stage */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground mr-1">
                Color:
              </span>
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  className={`h-5 w-5 rounded-full ${COLOR_SWATCHES[c]} transition-all ${
                    newColor === c
                      ? "ring-2 ring-offset-1 ring-foreground scale-110"
                      : "hover:scale-110"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
