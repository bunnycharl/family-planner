export interface CalendarItem {
  id: string;
  title: string;
  startDate: string;
  endDate?: string | null;
  itemType: "event" | "task";
  category?: { id: string; name: string; color: string } | null;
  createdBy?: { id: string; name: string; avatarColor: string } | null;
  assignees?: { id: string; name: string }[];
  // Task-specific
  taskStatus?: "TODO" | "IN_PROGRESS" | "DONE";
  taskPriority?: "LOW" | "MEDIUM" | "HIGH";
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export function eventToCalendarItem(event: any): CalendarItem {
  return {
    id: event.id,
    title: event.title,
    startDate: event.startDate,
    endDate: event.endDate ?? null,
    itemType: "event",
    category: event.category ?? null,
    createdBy: event.createdBy ?? null,
    assignees: event.assignees,
  };
}

export function taskToCalendarItem(task: any): CalendarItem {
  return {
    id: task.id,
    title: task.title,
    startDate: task.dueDate,
    endDate: null,
    itemType: "task",
    category: task.category ?? null,
    createdBy: task.createdBy ?? null,
    taskStatus: task.status,
    taskPriority: task.priority,
  };
}
