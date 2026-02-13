import { z } from "zod";

export const createRoadmapPhaseSchema = z.object({
  name: z.string().min(1).max(200),
  emoji: z.string().max(10).optional(),
  position: z.number().int().min(0).optional(),
});

export const updateRoadmapPhaseSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  emoji: z.string().max(10).optional(),
  position: z.number().int().min(0).optional(),
});

export const createRoadmapTaskSchema = z.object({
  name: z.string().min(1).max(300),
  details: z.string().max(2000).optional(),
  taskType: z.string().min(1).max(50),
  startDate: z.string(),
  endDate: z.string(),
  phaseId: z.string().min(1),
  position: z.number().int().min(0).optional(),
  isCompleted: z.boolean().optional(),
});

export const updateRoadmapTaskSchema = z.object({
  name: z.string().min(1).max(300).optional(),
  details: z.string().max(2000).optional(),
  taskType: z.string().min(1).max(50).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  phaseId: z.string().optional(),
  position: z.number().int().min(0).optional(),
  isCompleted: z.boolean().optional(),
});

export type CreateRoadmapPhaseInput = z.infer<typeof createRoadmapPhaseSchema>;
export type UpdateRoadmapPhaseInput = z.infer<typeof updateRoadmapPhaseSchema>;
export type CreateRoadmapTaskInput = z.infer<typeof createRoadmapTaskSchema>;
export type UpdateRoadmapTaskInput = z.infer<typeof updateRoadmapTaskSchema>;
