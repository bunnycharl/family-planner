import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  location: z.string().max(500).optional(),
  categoryId: z.string().optional(),
  assigneeIds: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.string().max(500).optional(),
  isCompleted: z.boolean().optional(),
  color: z.string().max(50).optional(),
});

export const updateEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200).optional(),
  description: z.string().max(5000).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().max(500).optional(),
  categoryId: z.string().optional(),
  assigneeIds: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.string().max(500).optional(),
  isCompleted: z.boolean().optional(),
  color: z.string().max(50).optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
