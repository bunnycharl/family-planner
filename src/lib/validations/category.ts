import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string(),
  icon: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
