"use client";

import { Draggable } from "@hello-pangea/dnd";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TaskCardTask {
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

interface TaskCardProps {
  task: TaskCardTask;
  onClick: (task: TaskCardTask) => void;
  index: number;
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  HIGH: { bg: "bg-red-100", text: "text-red-700", label: "Высокий" },
  MEDIUM: { bg: "bg-amber-100", text: "text-amber-700", label: "Средний" },
  LOW: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Низкий" },
};

export function TaskCard({ task, onClick, index }: TaskCardProps) {
  const initials = task.assignee
    ? task.assignee.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : null;

  const priorityStyle = PRIORITY_STYLES[task.priority];

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={cn(
            "rounded-xl bg-[var(--color-bg-card)] p-4 shadow-sm border border-[var(--color-border)]",
            "cursor-grab transition-all hover:shadow-md hover:border-[var(--color-primary)]/30",
            snapshot.isDragging && "shadow-xl ring-2 ring-[var(--color-primary)] rotate-2 scale-105"
          )}
        >
          {/* Priority badge */}
          <div className="mb-2 flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
                priorityStyle.bg,
                priorityStyle.text
              )}
            >
              {priorityStyle.label}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-sm font-semibold text-[var(--color-text)] line-clamp-2 mb-2">
            {task.title}
          </h4>

          {/* Description preview */}
          {task.description && (
            <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-3">
              {task.description}
            </p>
          )}

          {/* Bottom row: meta info */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-light)]">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Due date */}
              {task.dueDate && (
                <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {format(new Date(task.dueDate), "d MMM", { locale: ru })}
                </span>
              )}

              {/* Category badge */}
              {task.category && (
                <span
                  className="inline-flex rounded-lg px-2 py-0.5 text-[10px] font-semibold text-white"
                  style={{ backgroundColor: task.category.color }}
                >
                  {task.category.name}
                </span>
              )}
            </div>

            {/* Assignee avatar */}
            {initials && task.assignee && (
              <div
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm"
                style={{ backgroundColor: task.assignee.avatarColor }}
                title={task.assignee.name}
              >
                {initials}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
