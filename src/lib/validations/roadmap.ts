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

export type CreateRoadmapPhaseInput = z.infer<typeof createRoadmapPhaseSchema>;
export type UpdateRoadmapPhaseInput = z.infer<typeof updateRoadmapPhaseSchema>;
