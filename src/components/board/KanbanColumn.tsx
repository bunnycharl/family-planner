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
        "flex flex-col rounded-xl bg-gray-100 p-3",
        "min-h-[200px] min-w-[85vw] snap-center md:min-w-0 md:flex-1"
      )}
    >
      {/* Column header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-200 px-1.5 text-xs font-medium text-gray-600">
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
              "flex flex-1 flex-col gap-2 rounded-lg p-1 transition-colors",
              snapshot.isDraggingOver && "bg-indigo-50"
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
          "mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-2",
          "text-sm text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
        )}
      >
        <svg
          className="h-4 w-4"
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
        Добавить
      </button>
    </div>
  );
}
