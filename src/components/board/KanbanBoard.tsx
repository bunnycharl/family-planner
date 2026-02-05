"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/useTasks";
import { useCategories } from "@/hooks/useCategories";
import { KanbanColumn } from "./KanbanColumn";
import { TaskForm } from "./TaskForm";

type SortOrder = "none" | "asc" | "desc";

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
  { status: "TODO", title: "К выполнению", icon: "circle" },
  { status: "IN_PROGRESS", title: "В процессе", icon: "progress" },
  { status: "DONE", title: "Готово", icon: "check" },
] as const;

export function KanbanBoard() {
  const { tasks, isLoading, mutate } = useTasks();
  const { categories } = useCategories();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<
    "TODO" | "IN_PROGRESS" | "DONE"
  >("TODO");

  // Filter & sort state
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortByDate, setSortByDate] = useState<SortOrder>("none");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    }
    if (categoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [categoryDropdownOpen]);

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = tasks as Task[];

    // Apply category filter
    if (categoryFilter) {
      result = result.filter((t) => t.categoryId === categoryFilter);
    }

    return result;
  }, [tasks, categoryFilter]);

  const groupedTasks = useMemo(() => {
    return COLUMNS.map((col) => {
      let columnTasks = filteredAndSortedTasks
        .filter((t) => t.status === col.status);

      // Apply sorting
      if (sortByDate === "asc") {
        // Ближайшие сначала (asc) - задачи без даты в конце
        columnTasks = [...columnTasks].sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return a.position - b.position;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
      } else if (sortByDate === "desc") {
        // Дальние сначала (desc)
        columnTasks = [...columnTasks].sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return a.position - b.position;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        });
      } else {
        // Default: sort by position
        columnTasks = [...columnTasks].sort((a, b) => a.position - b.position);
      }

      return { ...col, tasks: columnTasks };
    });
  }, [filteredAndSortedTasks, sortByDate]);

  const selectedCategory = categories.find((c: { id: string }) => c.id === categoryFilter);

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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <>
      {/* Filters & Sort */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Category filter */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
            className={cn(
              "flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm transition-all cursor-pointer",
              categoryFilter
                ? "border-[var(--color-primary)] bg-[var(--color-primary-50)]"
                : "border-[var(--color-border)] bg-[var(--color-bg-card)]"
            )}
          >
            <svg className="h-4 w-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {selectedCategory ? (
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selectedCategory.color }} />
                <span className="text-[var(--color-text)]">{selectedCategory.name}</span>
              </span>
            ) : (
              <span className="text-[var(--color-text-muted)]">Категория</span>
            )}
            <svg className={cn("h-4 w-4 text-[var(--color-text-muted)] transition-transform", categoryDropdownOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {categoryDropdownOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 min-w-[180px] rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-lg">
              <button
                type="button"
                onClick={() => { setCategoryFilter(null); setCategoryDropdownOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors cursor-pointer",
                  !categoryFilter ? "bg-[var(--color-primary-50)] text-[var(--color-primary)] font-semibold" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
                )}
              >
                Все категории
              </button>
              {categories.map((cat: { id: string; name: string; color: string }) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { setCategoryFilter(cat.id); setCategoryDropdownOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors cursor-pointer",
                    categoryFilter === cat.id ? "bg-[var(--color-primary-50)] text-[var(--color-primary)] font-semibold" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
                  )}
                >
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort by date */}
        <button
          type="button"
          onClick={() => {
            if (sortByDate === "none") setSortByDate("asc");
            else if (sortByDate === "asc") setSortByDate("desc");
            else setSortByDate("none");
          }}
          className={cn(
            "flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm transition-all cursor-pointer",
            sortByDate !== "none"
              ? "border-[var(--color-primary)] bg-[var(--color-primary-50)]"
              : "border-[var(--color-border)] bg-[var(--color-bg-card)]"
          )}
        >
          <svg className="h-4 w-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={sortByDate !== "none" ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}>
            {sortByDate === "none" && "По дате"}
            {sortByDate === "asc" && "Ближайшие"}
            {sortByDate === "desc" && "Дальние"}
          </span>
          {sortByDate !== "none" && (
            <svg className={cn("h-4 w-4 text-[var(--color-primary)]", sortByDate === "desc" && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          )}
        </button>

        {/* Clear filters */}
        {(categoryFilter || sortByDate !== "none") && (
          <button
            type="button"
            onClick={() => { setCategoryFilter(null); setSortByDate("none"); }}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-all cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Сбросить
          </button>
        )}
      </div>

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
