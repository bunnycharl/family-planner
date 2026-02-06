import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional().default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().default("MEDIUM"),
  dueDate: z.string().optional(),
  categoryId: z.string().optional(),
  assigneeId: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().optional(),
  categoryId: z.string().optional(),
  assigneeId: z.string().optional(),
});

export const moveTaskSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  position: z.number().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
