"use client";

import { useState, useEffect } from "react";
import { PencilIcon, SquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type TaskModalHeaderProps = {
  taskNumber: number;
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

  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  const creatorTag = creatorEmail.split("@")[0].slice(0, 3).toUpperCase();

  const handleSaveTitle = () => {
    onTitleChange(editedTitle);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveTitle();
    if (e.key === "Escape") {
      setEditedTitle(title);
      setIsEditing(false);
    }
  };

  return (
    <>
      {/* Status symbol with color */}
      {/* // TODO: Make symbol dynamic based on related items (reviews, workflows, etc.) */}
      <div
        className="size-8 rounded flex items-center justify-center"
        style={{ backgroundColor: statusColor }}
      >
        <SquareIcon className="size-4 text-white" />
      </div>

      {/* Task number and creator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-mono">#{taskNumber}</span>
        <Separator orientation="vertical" className="h-4" />
        <span>@{creatorTag}</span>
      </div>

      {/* Title with edit */}
      <div className="flex items-center gap-2">
        {isEditing ? (
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={handleKeyDown}
            className="h-8 text-lg font-semibold w-64"
            autoFocus
          />
        ) : (
          <>
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => setIsEditing(true)}
            >
              <PencilIcon className="size-3" />
            </Button>
          </>
        )}
      </div>
    </>
  );
};
