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

const STATUS_BG: Record<string, string> = {
  TODO: "bg-[var(--c-gray)]",
  IN_PROGRESS: "bg-[var(--c-yellow)]/30",
  DONE: "bg-[var(--c-mint)]/30",
};

export function KanbanColumn({ title, status, tasks, onTaskClick, onAddTask }: KanbanColumnProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-3xl p-5",
        "min-h-[300px] min-w-[85vw] snap-center md:min-w-0 md:flex-1",
        STATUS_BG[status] ?? "bg-[var(--c-gray)]"
      )}
    >
      {/* Column header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="bg-[var(--c-black)] text-white rounded-full px-3 py-1 text-xs font-bold uppercase">
            {title}
          </h3>
          <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-white px-2 text-xs font-bold text-[var(--c-black)]">
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
              "flex flex-1 flex-col gap-3 rounded-2xl p-2 transition-all",
              snapshot.isDraggingOver &&
                "bg-[var(--c-lavender)]/20 ring-2 ring-[var(--c-lavender)]/30"
            )}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} onClick={onTaskClick} index={index} />
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
          "mt-3 flex w-full items-center justify-center gap-2 rounded-full py-3",
          "text-sm font-bold uppercase text-[var(--c-black)]",
          "border-2 border-dashed border-[var(--c-black)]/30",
          "hover:border-[var(--c-black)] hover:bg-white",
          "transition-all cursor-pointer"
        )}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Добавить
      </button>
    </div>
  );
}
