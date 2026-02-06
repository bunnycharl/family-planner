export const TASK_STATUSES = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
} as const;

export const TASK_STATUS_LABELS: Record<string, string> = {
  TODO: "К выполнению",
  IN_PROGRESS: "В процессе",
  DONE: "Готово",
};

export const TASK_PRIORITIES = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
};

export const KANBAN_COLUMNS = [
  { status: TASK_STATUSES.TODO, title: TASK_STATUS_LABELS.TODO, icon: "circle" },
  { status: TASK_STATUSES.IN_PROGRESS, title: TASK_STATUS_LABELS.IN_PROGRESS, icon: "progress" },
  { status: TASK_STATUSES.DONE, title: TASK_STATUS_LABELS.DONE, icon: "check" },
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[keyof typeof TASK_STATUSES];
export type TaskPriority = (typeof TASK_PRIORITIES)[keyof typeof TASK_PRIORITIES];
