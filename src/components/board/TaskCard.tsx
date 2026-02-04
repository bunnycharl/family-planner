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

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-yellow-400",
  LOW: "bg-green-500",
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

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={cn(
            "rounded-lg border border-gray-100 bg-white p-3 shadow-sm",
            "cursor-grab transition-shadow hover:shadow-md",
            snapshot.isDragging && "shadow-lg ring-2 ring-indigo-200"
          )}
        >
          {/* Title row with priority dot */}
          <div className="mb-1 flex items-start gap-2">
            <span
              className={cn(
                "mt-1.5 h-2 w-2 flex-shrink-0 rounded-full",
                PRIORITY_COLORS[task.priority]
              )}
            />
            <span className="text-sm font-medium text-gray-900 line-clamp-2">
              {task.title}
            </span>
          </div>

          {/* Bottom row: meta info */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Due date */}
              {task.dueDate && (
                <span className="text-xs text-gray-500">
                  {format(new Date(task.dueDate), "d MMM", { locale: ru })}
                </span>
              )}

              {/* Category badge */}
              {task.category && (
                <span
                  className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: task.category.color }}
                >
                  {task.category.name}
                </span>
              )}
            </div>

            {/* Assignee avatar */}
            {initials && task.assignee && (
              <div
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-medium text-white"
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
