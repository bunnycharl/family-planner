import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  color: z.string().max(50),
  icon: z.string().max(50).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  color: z.string().max(50).optional(),
  icon: z.string().max(50).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
