import { z } from "zod";

export const createTaskSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().max(5000).optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional().default("TODO"),
    startDate: z.string(),
    endDate: z.string(),
    categoryId: z.string().optional(),
    assigneeId: z.string().optional(),
    showOnRoadmap: z.boolean().optional().default(false),
    phaseId: z.string().optional(),
  })
  .refine((data) => !data.showOnRoadmap || !!data.phaseId, {
    message: "Фаза обязательна для задач на роадмапе",
    path: ["phaseId"],
  });

export const updateTaskSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200).optional(),
    description: z.string().max(5000).optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    categoryId: z.string().optional(),
    assigneeId: z.string().optional(),
    showOnRoadmap: z.boolean().optional(),
    phaseId: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.showOnRoadmap === true && data.phaseId === null) return false;
      return true;
    },
    {
      message: "Фаза обязательна для задач на роадмапе",
      path: ["phaseId"],
    }
  );

export const moveTaskSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  position: z.number().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
