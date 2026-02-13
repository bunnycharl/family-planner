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

interface BaseUser {
  id: string;
  name: string;
  avatarColor: string;
}

interface BaseCategory {
  id: string;
  name: string;
  color: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  category?: BaseCategory | null;
  createdBy?: BaseUser | null;
  assignee?: BaseUser | null;
}

interface CalendarTask {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  category?: BaseCategory | null;
  createdBy?: BaseUser | null;
  assignee?: BaseUser | null;
}

export function eventToCalendarItem(event: CalendarEvent): CalendarItem {
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

export function taskToCalendarItem(task: CalendarTask): CalendarItem {
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
