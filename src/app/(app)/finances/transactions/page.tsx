"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useBudgetYear } from "@/hooks/finances/useBudgetYear";
import { useTransactionCategories } from "@/hooks/finances/useTransactionCategories";
import { useTransactions } from "@/hooks/finances/useTransactions";
import { useTransactionMutations } from "@/hooks/finances/useTransactionMutations";
import { YearSelector } from "@/components/finances/shared/YearSelector";
import { MonthNavigator } from "@/components/finances/shared/MonthNavigator";
import { TransactionSummaryCard } from "@/components/finances/transactions/TransactionSummaryCard";
import { CategoryChips } from "@/components/finances/transactions/CategoryChips";
import { TransactionList } from "@/components/finances/transactions/TransactionList";
import { TransactionForm } from "@/components/finances/transactions/TransactionForm";
import type { TransactionData } from "@/lib/finances/types";

export default function TransactionsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionData | null>(null);

  const { data: budgetData, isLoading: budgetLoading } = useBudgetYear(year);
  const { categories, mutate: mutateCategories } = useTransactionCategories(year);
  const {
    data: txData,
    isLoading: txLoading,
    mutate: mutateTxList,
  } = useTransactions(year, selectedMonth, selectedCategoryId);
  const mutations = useTransactionMutations(year, mutateTxList, mutateCategories);

  if (budgetLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--c-gray)] border-t-[var(--c-coral)]" />
      </div>
    );
  }

  if (!budgetData) {
    return (
      <div className="space-y-4">
        <YearSelector year={year} onChange={setYear} />
        <div className="flex min-h-[200px] items-center justify-center text-sm font-bold uppercase text-[var(--c-black)]/40">
          Бюджет на {year} год не создан. Перейдите в Настройки.
        </div>
      </div>
    );
  }

  function handleEdit(t: TransactionData) {
    setEditingTransaction(t);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить транзакцию?")) return;
    try {
      await mutations.deleteTransaction(id);
      toast.success("Транзакция удалена");
    } catch {
      toast.error("Ошибка при удалении");
    }
  }

  async function handleSave(data: {
    categoryId: string;
    amount: number;
    date: string;
    description?: string | null;
  }) {
    try {
      if (editingTransaction) {
        await mutations.updateTransaction(editingTransaction.id, data);
        toast.success("Транзакция обновлена");
      } else {
        await mutations.createTransaction(data);
        toast.success("Расход добавлен");
      }
    } catch {
      toast.error("Ошибка при сохранении");
      throw new Error();
    }
  }

  async function handleFormDelete(id: string) {
    try {
      await mutations.deleteTransaction(id);
      toast.success("Транзакция удалена");
      setShowForm(false);
      setEditingTransaction(null);
    } catch {
      toast.error("Ошибка при удалении");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <YearSelector year={year} onChange={setYear} />
        <MonthNavigator selectedMonth={selectedMonth} onSelect={setSelectedMonth} />
      </div>

      <div className="animate-fade-in-up">
        <TransactionSummaryCard
          totalAmount={txData?.totalAmount ?? 0}
          transactionCount={txData?.total ?? 0}
          baseCurrency={budgetData.baseCurrency}
          selectedMonth={selectedMonth}
        />
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "80ms" }}>
        <CategoryChips
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "160ms" }}>
        {txLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--c-gray)] border-t-[var(--c-coral)]" />
          </div>
        ) : (
          <TransactionList
            transactions={txData?.transactions ?? []}
            baseCurrency={budgetData.baseCurrency}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* FAB */}
      <button
        type="button"
        onClick={() => {
          setEditingTransaction(null);
          setShowForm(true);
        }}
        className="fixed bottom-6 right-6 z-30 flex h-14 items-center gap-2 rounded-full bg-[var(--c-coral)] px-6 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer md:bottom-8 md:right-8"
      >
        <span className="text-lg">+</span>
        Добавить расход
      </button>

      {/* Form Sheet */}
      {showForm && (
        <TransactionForm
          categories={categories}
          transaction={editingTransaction}
          onSave={handleSave}
          onDelete={handleFormDelete}
          onClose={() => {
            setShowForm(false);
            setEditingTransaction(null);
          }}
        />
      )}
    </div>
  );
}
