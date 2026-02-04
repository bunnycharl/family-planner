"use client";

import { useState, useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/useTasks";
import { KanbanColumn } from "./KanbanColumn";
import { TaskForm } from "./TaskForm";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  position: number;
  dueDate?: string | null;
  categoryId?: string | null;
  assigneeId?: string | null;
  category?: {
    name: string;
    color: string;
  } | null;
  createdBy: {
    name: string;
    avatarColor: string;
  };
  assignee?: {
    name: string;
    avatarColor: string;
  } | null;
}

const COLUMNS = [
  { status: "TODO", title: "К выполнению" },
  { status: "IN_PROGRESS", title: "В процессе" },
  { status: "DONE", title: "Готово" },
] as const;

export function KanbanBoard() {
  const { tasks, isLoading, mutate } = useTasks();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<
    "TODO" | "IN_PROGRESS" | "DONE"
  >("TODO");

  const groupedTasks = COLUMNS.map((col) => ({
    ...col,
    tasks: (tasks as Task[])
      .filter((t) => t.status === col.status)
      .sort((a, b) => a.position - b.position),
  }));

  const handleAddTask = useCallback(
    (status: "TODO" | "IN_PROGRESS" | "DONE") => {
      setEditingTask(null);
      setDefaultStatus(status);
      setIsFormOpen(true);
    },
    []
  );

  const handleTaskClick = useCallback((task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingTask(null);
  }, []);

  const handleFormSave = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination, draggableId } = result;

      if (!destination) return;

      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      const newStatus = destination.droppableId as
        | "TODO"
        | "IN_PROGRESS"
        | "DONE";
      const newPosition = destination.index;

      // Optimistic update
      const updatedTasks = (tasks as Task[]).map((t) => {
        if (t.id === draggableId) {
          return { ...t, status: newStatus, position: newPosition };
        }
        return t;
      });

      // Reorder tasks in the destination column
      const destColumnTasks = updatedTasks
        .filter((t) => t.status === newStatus && t.id !== draggableId)
        .sort((a, b) => a.position - b.position);

      const movedTask = updatedTasks.find((t) => t.id === draggableId);
      if (movedTask) {
        destColumnTasks.splice(newPosition, 0, movedTask);
      }

      const reorderedTasks = destColumnTasks.map((t, i) => ({
        ...t,
        position: i,
      }));

      // If source column is different, also reorder source column
      const sourceStatus = source.droppableId as
        | "TODO"
        | "IN_PROGRESS"
        | "DONE";
      let finalTasks: Task[];

      if (sourceStatus !== newStatus) {
        const sourceColumnTasks = updatedTasks
          .filter((t) => t.status === sourceStatus && t.id !== draggableId)
          .sort((a, b) => a.position - b.position)
          .map((t, i) => ({ ...t, position: i }));

        const otherTasks = updatedTasks.filter(
          (t) => t.status !== newStatus && t.status !== sourceStatus
        );

        finalTasks = [...otherTasks, ...sourceColumnTasks, ...reorderedTasks];
      } else {
        const otherTasks = updatedTasks.filter((t) => t.status !== newStatus);
        finalTasks = [...otherTasks, ...reorderedTasks];
      }

      mutate(finalTasks, false);

      try {
        const res = await fetch(`/api/tasks/${draggableId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            position: newPosition,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to move task");
        }

        mutate();
      } catch {
        toast.error("Не удалось переместить задачу");
        mutate();
      }
    },
    [tasks, mutate]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          className={cn(
            "flex gap-4 overflow-x-auto pb-4",
            "snap-x snap-mandatory md:snap-none",
            "px-4 md:px-0"
          )}
        >
          {groupedTasks.map((col) => (
            <KanbanColumn
              key={col.status}
              title={col.title}
              status={col.status}
              tasks={col.tasks}
              onTaskClick={handleTaskClick}
              onAddTask={() => handleAddTask(col.status)}
            />
          ))}
        </div>
      </DragDropContext>

      <TaskForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        task={editingTask}
        defaultStatus={defaultStatus}
        onSave={handleFormSave}
      />
    </>
  );
}
