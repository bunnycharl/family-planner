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
  position: number;
  startDate?: string | null;
  endDate?: string | null;
  phaseId?: string | null;
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

export function TaskCard({ task, onClick, index }: TaskCardProps) {
  const initials = task.assignee
    ? task.assignee.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : null;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={cn(
            "rounded-3xl bg-white p-4",
            "cursor-grab transition-all hover:-translate-y-1",
            snapshot.isDragging && "shadow-xl ring-2 ring-[var(--c-lavender)] rotate-2 scale-105"
          )}
        >
          {/* Title */}
          <h4 className="text-sm font-bold text-[var(--c-black)] line-clamp-2 mb-2">
            {task.title}
          </h4>

          {/* Description preview */}
          {task.description && (
            <p className="text-xs text-[#999] line-clamp-2 mb-3">{task.description}</p>
          )}

          {/* Bottom row: meta info */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Due date */}
              {task.endDate && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#666]">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {format(new Date(task.endDate), "d MMM", { locale: ru })}
                </span>
              )}

              {/* Category badge */}
              {task.category && (
                <span className="bg-[var(--c-black)] text-white rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
                  {task.category.name}
                </span>
              )}
            </div>

            {/* Assignee avatar */}
            {initials && task.assignee && (
              <div
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
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
