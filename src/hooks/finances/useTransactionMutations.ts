import { useCallback } from "react";

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

export function useTransactionMutations(
  year: number,
  mutateList: () => void,
  mutateCategories: () => void
) {
  const base = `/api/budget/${year}`;

  // ─── Transaction Categories ────────────────────────────────

  const createCategory = useCallback(
    async (data: { name: string; color: string; expenseCategoryId?: string | null }) => {
      await apiFetch(`${base}/transaction-categories`, "POST", data);
      mutateCategories();
    },
    [base, mutateCategories]
  );

  const updateCategory = useCallback(
    async (
      id: string,
      data: { name?: string; color?: string; expenseCategoryId?: string | null; sortOrder?: number }
    ) => {
      await apiFetch(`${base}/transaction-categories/${id}`, "PUT", data);
      mutateCategories();
    },
    [base, mutateCategories]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      await apiFetch(`${base}/transaction-categories/${id}`, "DELETE");
      mutateCategories();
      mutateList();
    },
    [base, mutateCategories, mutateList]
  );

  // ─── Transactions ──────────────────────────────────────────

  const createTransaction = useCallback(
    async (data: {
      categoryId: string;
      amount: number;
      date: string;
      description?: string | null;
    }) => {
      await apiFetch(`${base}/transactions`, "POST", data);
      mutateList();
    },
    [base, mutateList]
  );

  const updateTransaction = useCallback(
    async (
      id: string,
      data: {
        categoryId?: string;
        amount?: number;
        date?: string;
        description?: string | null;
      }
    ) => {
      await apiFetch(`${base}/transactions/${id}`, "PUT", data);
      mutateList();
    },
    [base, mutateList]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      await apiFetch(`${base}/transactions/${id}`, "DELETE");
      mutateList();
    },
    [base, mutateList]
  );

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
