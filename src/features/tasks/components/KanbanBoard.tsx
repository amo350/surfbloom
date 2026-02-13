"use client";

import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { useCallback, useEffect, useState } from "react";
import { useBulkUpdateTaskPositions } from "../hooks/use-tasks";
import { KanbanCard } from "./KanbanCard";
import { KanbanColumnHeader } from "./KanbanColumnHeader";

type Task = {
  id: string;
  name: string;
  columnId: string;
  position: number;
  taskNumber: number;
  reviewId?: string | null;
  assignee: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  column: {
    id: string;
    name: string;
    color: string;
  };
};

type Column = {
  id: string;
  name: string;
  color: string;
  position: number;
};

type KanbanBoardProps = {
  tasks: Task[];
  columns: Column[];
  workspaceId: string;
  selectedTaskIds: string[];
  onTaskSelect: (taskId: string, selected: boolean) => void;
  onOpenTask: (taskId: string) => void;
  onAddTask?: (columnId: string) => void;
  returnUrl?: string;
};

type TasksByColumn = Record<string, Task[]>;

export const KanbanBoard = ({
  tasks,
  columns,
  workspaceId,
  selectedTaskIds,
  onTaskSelect,
  onOpenTask,
  onAddTask,
  returnUrl,
}: KanbanBoardProps) => {
  const bulkUpdatePositions = useBulkUpdateTaskPositions();

  // Group tasks by column and sort by position
  const getTasksByColumn = useCallback((): TasksByColumn => {
    const grouped: TasksByColumn = {};

    columns.forEach((col) => {
      grouped[col.id] = [];
    });

    tasks.forEach((task) => {
      if (grouped[task.columnId]) {
        grouped[task.columnId].push(task);
      }
    });

    Object.keys(grouped).forEach((colId) => {
      grouped[colId].sort((a, b) => a.position - b.position);
    });

    return grouped;
  }, [tasks, columns]);

  const [tasksByColumn, setTasksByColumn] =
    useState<TasksByColumn>(getTasksByColumn);

  useEffect(() => {
    setTasksByColumn(getTasksByColumn());
  }, [getTasksByColumn]);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const { source, destination } = result;
      const sourceColId = source.droppableId;
      const destColId = destination.droppableId;

      if (sourceColId === destColId && source.index === destination.index) {
        return;
      }

      const updatesPayload: {
        id: string;
        columnId: string;
        position: number;
      }[] = [];

      setTasksByColumn((prev) => {
        const newState = { ...prev };

        const sourceColumn = [...(newState[sourceColId] || [])];
        const destColumn =
          sourceColId === destColId
            ? sourceColumn
            : [...(newState[destColId] || [])];

        const [movedTask] = sourceColumn.splice(source.index, 1);

        if (!movedTask) {
          console.error("No task found at source index");
          return prev;
        }

        const updatedTask =
          sourceColId !== destColId
            ? { ...movedTask, columnId: destColId }
            : movedTask;

        destColumn.splice(destination.index, 0, updatedTask);

        newState[sourceColId] = sourceColumn;
        if (sourceColId !== destColId) {
          newState[destColId] = destColumn;
        }

        destColumn.forEach((task, index) => {
          const newPosition = (index + 1) * 1000;
          if (task.position !== newPosition || task.id === movedTask.id) {
            updatesPayload.push({
              id: task.id,
              columnId: destColId,
              position: newPosition,
            });
          }
        });

        if (sourceColId !== destColId) {
          sourceColumn.forEach((task, index) => {
            const newPosition = (index + 1) * 1000;
            if (task.position !== newPosition) {
              updatesPayload.push({
                id: task.id,
                columnId: sourceColId,
                position: newPosition,
              });
            }
          });
        }

        return newState;
      });

      if (updatesPayload.length > 0) {
        bulkUpdatePositions.mutate({
          workspaceId,
          updates: updatesPayload,
        });
      }
    },
    [workspaceId, bulkUpdatePositions],
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {/* Container that fills available space, no overflow on parent */}
      <div className="flex gap-0.5 h-full w-full">
        {columns
          .sort((a, b) => a.position - b.position)
          .map((column) => {
            const columnTasks = tasksByColumn[column.id] || [];

            return (
              <div
                key={column.id}
                className="flex-1 min-w-0 flex flex-col bg-muted/50 rounded-lg"
              >
                <KanbanColumnHeader
                  title={column.name}
                  color={column.color}
                  count={columnTasks.length}
                  onAddTask={onAddTask ? () => onAddTask(column.id) : undefined}
                />

                {/* Color bar under header */}
                <div
                  className="h-1 mx-2 rounded-full"
                  style={{
                    background: `linear-gradient(180deg, ${column.color}66 0%, ${column.color}33 100%)`,
                    boxShadow: `0 1px 2px ${column.color}22, inset 0 1px 1px rgba(255,255,255,0.3)`,
                    backdropFilter: "blur(4px)",
                  }}
                />

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto p-2 min-h-[200px] ${
                        snapshot.isDraggingOver ? "bg-muted/80" : ""
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <KanbanCard
                                id={task.id}
                                name={task.name}
                                taskNumber={task.taskNumber}
                                statusColor={column.color}
                                creatorName={task.assignee?.name ?? "user"}
                                workspaceId={workspaceId}
                                isSelected={selectedTaskIds.includes(task.id)}
                                onSelect={onTaskSelect}
                                onOpenTask={onOpenTask}
                                returnUrl={returnUrl}
                                reviewId={task.reviewId}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
      </div>
    </DragDropContext>
  );
};
