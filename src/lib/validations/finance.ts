import { z } from "zod";

const monthSchema = z.number().int().min(1).max(12);
const yearSchema = z.number().int().min(2020).max(2100);

export const upsertIncomeSchema = z.object({
  personId: z.string().min(1),
  year: yearSchema,
  month: monthSchema,
  entries: z
    .array(
      z.object({
        category: z.string().min(1),
        amount: z.number().min(0),
      })
    )
    .min(1),
});

export const upsertIncomeParamsSchema = z.object({
  personId: z.string().min(1),
  year: yearSchema,
  month: monthSchema,
  params: z
    .array(
      z.object({
        key: z.string().min(1),
        value: z.number().min(0),
      })
    )
    .min(1),
});

export const upsertExchangeRateSchema = z.object({
  year: yearSchema,
  month: monthSchema,
  eurRub: z.number().positive(),
});

export const upsertExpensesSchema = z.object({
  year: yearSchema,
  month: monthSchema,
  group: z.enum(["moscow", "spain", "onetime"]),
  entries: z
    .array(
      z.object({
        category: z.string().min(1),
        amount: z.number().min(0),
      })
    )
    .min(1),
});

export type UpsertIncomeInput = z.infer<typeof upsertIncomeSchema>;
export type UpsertIncomeParamsInput = z.infer<typeof upsertIncomeParamsSchema>;
export type UpsertExchangeRateInput = z.infer<typeof upsertExchangeRateSchema>;
export type UpsertExpensesInput = z.infer<typeof upsertExpensesSchema>;
