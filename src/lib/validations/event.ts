import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
  date: z.string(),
  categoryId: z.string().optional(),
  assigneeId: z.string().optional(),
});

export const updateEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200).optional(),
  description: z.string().max(5000).optional(),
  date: z.string().optional(),
  categoryId: z.string().optional(),
  assigneeId: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
