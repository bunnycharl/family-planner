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

export const createMilestoneSchema = z.object({
  name: z.string().min(1).max(300),
  details: z.string().max(2000).optional(),
  categoryId: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  phaseId: z.string().min(1),
  position: z.number().int().min(0).optional(),
  isCompleted: z.boolean().optional(),
});

export const updateMilestoneSchema = z.object({
  name: z.string().min(1).max(300).optional(),
  details: z.string().max(2000).optional(),
  categoryId: z.string().nullable().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  phaseId: z.string().optional(),
  position: z.number().int().min(0).optional(),
  isCompleted: z.boolean().optional(),
});

export type CreateRoadmapPhaseInput = z.infer<typeof createRoadmapPhaseSchema>;
export type UpdateRoadmapPhaseInput = z.infer<typeof updateRoadmapPhaseSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
