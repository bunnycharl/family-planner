"use client";

import { Droppable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { TaskCard } from "./TaskCard";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  position: number;
  dueDate?: string | null;
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

interface KanbanColumnProps {
  title: string;
  status: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
}

const STATUS_COLORS = {
  TODO: "bg-slate-100 border-slate-200",
  IN_PROGRESS: "bg-amber-50 border-amber-200",
  DONE: "bg-emerald-50 border-emerald-200",
};

const STATUS_HEADER_COLORS = {
  TODO: "text-slate-600 bg-slate-200",
  IN_PROGRESS: "text-amber-700 bg-amber-200",
  DONE: "text-emerald-700 bg-emerald-200",
};

export function KanbanColumn({
  title,
  status,
  tasks,
  onTaskClick,
  onAddTask,
}: KanbanColumnProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border-2 p-4",
        "min-h-[300px] min-w-[85vw] snap-center md:min-w-0 md:flex-1",
        STATUS_COLORS[status as keyof typeof STATUS_COLORS]
      )}
    >
      {/* Column header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-[var(--color-text)]">{title}</h3>
          <span
            className={cn(
              "flex h-6 min-w-[24px] items-center justify-center rounded-full px-2 text-xs font-bold",
              STATUS_HEADER_COLORS[status as keyof typeof STATUS_HEADER_COLORS]
            )}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Droppable task list */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex flex-1 flex-col gap-3 rounded-xl p-2 transition-all",
              snapshot.isDraggingOver &&
                "bg-[var(--color-primary)]/10 ring-2 ring-[var(--color-primary)]/30"
            )}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={onTaskClick}
                index={index}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add task button */}
      <button
        type="button"
        onClick={onAddTask}
        className={cn(
          "mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3",
          "text-sm font-semibold text-[var(--color-text-secondary)]",
          "border-2 border-dashed border-[var(--color-border)]",
          "hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-50)]",
          "transition-all cursor-pointer"
        )}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Добавить задачу
      </button>
    </div>
  );
}
