export interface CalendarItem {
  id: string;
  title: string;
  date: string;
  itemType: "event" | "task";
  category?: { id: string; name: string; color: string } | null;
  createdBy?: { id: string; name: string; avatarColor: string } | null;
  assignee?: { id: string; name: string; avatarColor: string } | null;
  // Task-specific
  taskStatus?: "TODO" | "IN_PROGRESS" | "DONE";
  taskStartDate?: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export function eventToCalendarItem(event: any): CalendarItem {
  return {
    id: event.id,
    title: event.title,
    date: event.date,
    itemType: "event",
    category: event.category ?? null,
    createdBy: event.createdBy ?? null,
    assignee: event.assignee ?? null,
  };
}

export function taskToCalendarItem(task: any): CalendarItem {
  return {
    id: task.id,
    title: task.title,
    date: task.endDate,
    itemType: "task",
    category: task.category ?? null,
    createdBy: task.createdBy ?? null,
    assignee: task.assignee ?? null,
    taskStatus: task.status,
    taskStartDate: task.startDate,
  };
}
