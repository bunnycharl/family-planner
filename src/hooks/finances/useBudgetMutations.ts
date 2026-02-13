import { useCallback } from "react";
import type { BulkUpsertInput } from "@/lib/finances/types";

async function apiFetch(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(text);
  }
  return res.json();
}

export function useBudgetMutations(year: number, mutate: () => void) {
  const base = `/api/budget/${year}`;

  // ─── Entries (bulk upsert) ───────────────────────────────────

  const saveEntries = useCallback(
    async (data: BulkUpsertInput) => {
      await apiFetch(`${base}/entries`, "PUT", data);
      mutate();
    },
    [base, mutate]
  );

  // ─── Copy month ─────────────────────────────────────────────

  const copyMonth = useCallback(
    async (fromMonth: number, toMonths: number[]) => {
      await apiFetch(`${base}/copy-month`, "POST", { fromMonth, toMonths });
      mutate();
    },
    [base, mutate]
  );

  // ─── Members ────────────────────────────────────────────────

  const createMember = useCallback(
    async (name: string) => {
      await apiFetch(`${base}/members`, "POST", { name });
      mutate();
    },
    [base, mutate]
  );

  const updateMember = useCallback(
    async (id: string, data: { name?: string; sortOrder?: number }) => {
      await apiFetch(`${base}/members/${id}`, "PUT", data);
      mutate();
    },
    [base, mutate]
  );

  const deleteMember = useCallback(
    async (id: string) => {
      await apiFetch(`${base}/members/${id}`, "DELETE");
      mutate();
    },
    [base, mutate]
  );

  // ─── Income categories ──────────────────────────────────────

  const createIncomeCategory = useCallback(
    async (data: {
      familyMemberId: string;
      name: string;
      type: "FIXED" | "FORMULA";
      taxRateId?: string | null;
      formula?: string | null;
    }) => {
      await apiFetch(`${base}/income-categories`, "POST", data);
      mutate();
    },
    [base, mutate]
  );

  const updateIncomeCategory = useCallback(
    async (
      id: string,
      data: {
        name?: string;
        type?: "FIXED" | "FORMULA";
        taxRateId?: string | null;
        formula?: string | null;
        sortOrder?: number;
      }
    ) => {
      await apiFetch(`${base}/income-categories/${id}`, "PUT", data);
      mutate();
    },
    [base, mutate]
  );

  const deleteIncomeCategory = useCallback(
    async (id: string) => {
      await apiFetch(`${base}/income-categories/${id}`, "DELETE");
      mutate();
    },
    [base, mutate]
  );

  // ─── Formula params ─────────────────────────────────────────

  const createFormulaParam = useCallback(
    async (categoryId: string, data: { name: string; paramKey: string }) => {
      await apiFetch(`${base}/income-categories/${categoryId}/params`, "POST", data);
      mutate();
    },
    [base, mutate]
  );

  const deleteFormulaParam = useCallback(
    async (categoryId: string, paramId: string) => {
      await apiFetch(`${base}/income-categories/${categoryId}/params`, "DELETE", { paramId });
      mutate();
    },
    [base, mutate]
  );

  // ─── Tax rates ──────────────────────────────────────────────

  const createTaxRate = useCallback(
    async (data: { name: string; rate: number }) => {
      await apiFetch(`${base}/tax-rates`, "POST", data);
      mutate();
    },
    [base, mutate]
  );

  const updateTaxRate = useCallback(
    async (id: string, data: { name?: string; rate?: number; sortOrder?: number }) => {
      await apiFetch(`${base}/tax-rates/${id}`, "PUT", data);
      mutate();
    },
    [base, mutate]
  );

  const deleteTaxRate = useCallback(
    async (id: string) => {
      await apiFetch(`${base}/tax-rates/${id}`, "DELETE");
      mutate();
    },
    [base, mutate]
  );

  // ─── Expense groups ─────────────────────────────────────────

  const createExpenseGroup = useCallback(
    async (data: { name: string; currency: string }) => {
      await apiFetch(`${base}/expense-groups`, "POST", data);
      mutate();
    },
    [base, mutate]
  );

  const updateExpenseGroup = useCallback(
    async (id: string, data: { name?: string; currency?: string; sortOrder?: number }) => {
      await apiFetch(`${base}/expense-groups/${id}`, "PUT", data);
      mutate();
    },
    [base, mutate]
  );

  const deleteExpenseGroup = useCallback(
    async (id: string) => {
      await apiFetch(`${base}/expense-groups/${id}`, "DELETE");
      mutate();
    },
    [base, mutate]
  );

  // ─── Expense categories ─────────────────────────────────────

  const createExpenseCategory = useCallback(
    async (groupId: string, data: { name: string }) => {
      await apiFetch(`${base}/expense-groups/${groupId}/categories`, "POST", data);
      mutate();
    },
    [base, mutate]
  );

  const deleteExpenseCategory = useCallback(
    async (groupId: string, catId: string) => {
      await apiFetch(`${base}/expense-groups/${groupId}/categories/${catId}`, "DELETE");
      mutate();
    },
    [base, mutate]
  );

  // ─── Reorder ────────────────────────────────────────────────

  const reorder = useCallback(
    async (type: string, items: { id: string; sortOrder: number }[]) => {
      await apiFetch(`${base}/reorder`, "PUT", { type, items });
      mutate();
    },
    [base, mutate]
  );

  return {
    saveEntries,
    copyMonth,
    createMember,
    updateMember,
    deleteMember,
    createIncomeCategory,
    updateIncomeCategory,
    deleteIncomeCategory,
    createFormulaParam,
    deleteFormulaParam,
    createTaxRate,
    updateTaxRate,
    deleteTaxRate,
    createExpenseGroup,
    updateExpenseGroup,
    deleteExpenseGroup,
    createExpenseCategory,
    deleteExpenseCategory,
    reorder,
  };
}
