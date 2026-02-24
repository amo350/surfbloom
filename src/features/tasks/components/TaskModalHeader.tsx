"use client";

import { PencilIcon, SquareIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type TaskModalHeaderProps = {
  taskNumber: number | null;
  title: string;
  statusColor: string;
  creatorEmail: string;
  onTitleChange: (newTitle: string) => void;
};

export const TaskModalHeader = ({
  taskNumber,
  title,
  statusColor,
  creatorEmail,
  onTitleChange,
}: TaskModalHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  // Keep editedTitle in sync when title prop changes (treat "Untitled task" as empty)
  const normalizedTitle =
    title?.trim() === "Untitled task" || !title?.trim() ? "" : title;
  useEffect(() => {
    setEditedTitle(normalizedTitle);
  }, [normalizedTitle]);

  const creatorTag = creatorEmail.split("@")[0].slice(0, 3).toUpperCase();

  const handleSaveTitle = () => {
    if (editedTitle.trim() !== normalizedTitle.trim()) {
      onTitleChange(editedTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveTitle();
    if (e.key === "Escape") {
      setEditedTitle(normalizedTitle);
      setIsEditing(false);
    }
  };

  const startEditing = () => setIsEditing(true);

  const displayTitle = editedTitle.trim() || null;

  return (
    <div className="flex items-center gap-3">
      {/* // TODO: Make symbol dynamic based on related items (reviews, workflows, etc.) */}
      <div
        className="size-8 rounded flex items-center justify-center"
        style={{ backgroundColor: statusColor }}
      >
        <SquareIcon className="size-4 text-white" />
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-mono">
          {taskNumber != null && taskNumber > 0 ? `#${taskNumber}` : "#-"}
        </span>
        <Separator orientation="vertical" className="h-4" />
        <span>@{creatorTag}</span>
      </div>

      <div className="flex items-center gap-2">
        {isEditing ? (
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={handleKeyDown}
            placeholder=""
            className="h-8 text-lg font-semibold w-64"
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={startEditing}
            className="flex items-center gap-2 text-left rounded-sm hover:bg-muted/50 -m-1 p-1 min-w-0"
          >
            <h2 className="text-lg font-semibold truncate min-w-0">
              {displayTitle ?? (
                <span className="italic text-muted-foreground">
                  Enter title
                </span>
              )}
            </h2>
            <PencilIcon className="size-3 shrink-0 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
};
