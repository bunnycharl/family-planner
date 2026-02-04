import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  categoryId: z.string().optional(),
  assigneeIds: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.string().optional(),
  isCompleted: z.boolean().optional(),
  color: z.string().optional(),
});

export const updateEventSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  categoryId: z.string().optional(),
  assigneeIds: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.string().optional(),
  isCompleted: z.boolean().optional(),
  color: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
