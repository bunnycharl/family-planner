"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useFinancePersons } from "@/hooks/useFinancePersons";
import { useFinanceIncomeCategories } from "@/hooks/useFinanceIncomeCategories";
import { useFinanceTaxRules } from "@/hooks/useFinanceTaxRules";
import { useExpenseGroups } from "@/hooks/useExpenseGroups";

type SettingsSection = "income" | "tax" | "expenses";

const SECTIONS: { key: SettingsSection; label: string }[] = [
  { key: "income", label: "Категории доходов" },
  { key: "tax", label: "Налоговые ставки" },
  { key: "expenses", label: "Группы расходов" },
];

export function FinanceSettings() {
  const [section, setSection] = useState<SettingsSection>("income");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSection(s.key)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold uppercase transition-all cursor-pointer",
              section === s.key
                ? "bg-[var(--c-black)] text-white"
                : "border-2 border-[var(--c-black)]/20 bg-white text-[var(--c-black)] hover:border-[var(--c-black)]/40"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "income" && <IncomeCategoriesSettings />}
      {section === "tax" && <TaxRulesSettings />}
      {section === "expenses" && <ExpenseGroupsSettings />}
    </div>
  );
}

// --- Income Categories ---

function IncomeCategoriesSettings() {
  const { persons, isLoading: personsLoading } = useFinancePersons();
  const { categories, isLoading: catsLoading, mutate } = useFinanceIncomeCategories();
  const [newName, setNewName] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState("");

  if (personsLoading || catsLoading) {
    return <SettingsLoader />;
  }

  const personId = selectedPersonId || persons[0]?.id || "";
  const filtered = categories.filter((c: { personId: string }) => c.personId === personId);

  async function handleAdd() {
    if (!newName.trim() || !personId) return;
    await fetch("/api/finances/income-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personId, name: newName.trim() }),
    });
    setNewName("");
    mutate();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/finances/income-categories/${id}`, { method: "DELETE" });
    mutate();
  }

  return (
    <div className="rounded-3xl bg-[var(--c-gray)] p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        {persons.map((p: { id: string; name: string }) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedPersonId(p.id)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold uppercase transition-all cursor-pointer",
              personId === p.id
                ? "bg-[var(--c-lavender)] text-white"
                : "bg-white text-[var(--c-black)] hover:bg-white/80"
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((cat: { id: string; name: string }) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-2xl bg-white px-4 py-3"
          >
            <span className="text-sm font-semibold">{cat.name}</span>
            <button
              type="button"
              onClick={() => handleDelete(cat.id)}
              className="rounded-full bg-[var(--c-coral)] px-3 py-1 text-xs font-bold text-white hover:opacity-80 transition-opacity cursor-pointer"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Новая категория..."
          className="flex-1 rounded-2xl border-2 border-[var(--c-black)]/10 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-[var(--c-lavender)] transition-colors"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="rounded-2xl bg-[var(--c-lavender)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-40"
        >
          Добавить
        </button>
      </div>
    </div>
  );
}

// --- Tax Rules ---

function TaxRulesSettings() {
  const { persons, isLoading: personsLoading } = useFinancePersons();
  const { rules, isLoading: rulesLoading, mutate } = useFinanceTaxRules();
  const { categories: allCategories, isLoading: catsLoading } = useFinanceIncomeCategories();
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newRate, setNewRate] = useState("");

  if (personsLoading || rulesLoading || catsLoading) {
    return <SettingsLoader />;
  }

  const personId = selectedPersonId || persons[0]?.id || "";
  const filtered = rules.filter((r: { personId: string }) => r.personId === personId);
  const personCategories = allCategories
    .filter((c: { personId: string }) => c.personId === personId)
    .map((c: { name: string }) => c.name);

  async function handleUpsert() {
    if (!newCategory || !newRate || !personId) return;
    const rate = parseFloat(newRate) / 100;
    if (isNaN(rate)) return;
    await fetch("/api/finances/tax-rules", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personId, category: newCategory, rate }),
    });
    setNewCategory("");
    setNewRate("");
    mutate();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/finances/tax-rules/${id}`, { method: "DELETE" });
    mutate();
  }

  return (
    <div className="rounded-3xl bg-[var(--c-gray)] p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        {persons.map((p: { id: string; name: string }) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedPersonId(p.id)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold uppercase transition-all cursor-pointer",
              personId === p.id
                ? "bg-[var(--c-lavender)] text-white"
                : "bg-white text-[var(--c-black)] hover:bg-white/80"
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((rule: { id: string; category: string; rate: number }) => (
          <div
            key={rule.id}
            className="flex items-center justify-between rounded-2xl bg-white px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{rule.category}</span>
              <span className="rounded-full bg-[var(--c-mint)] px-3 py-0.5 text-xs font-bold">
                {Math.round(rule.rate * 100)}%
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(rule.id)}
              className="rounded-full bg-[var(--c-coral)] px-3 py-1 text-xs font-bold text-white hover:opacity-80 transition-opacity cursor-pointer"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="flex-1 min-w-[160px] rounded-2xl border-2 border-[var(--c-black)]/10 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-[var(--c-lavender)] transition-colors cursor-pointer"
        >
          <option value="">Категория...</option>
          {personCategories.map((cat: string) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={newRate}
          onChange={(e) => setNewRate(e.target.value)}
          placeholder="Ставка %"
          className="w-28 rounded-2xl border-2 border-[var(--c-black)]/10 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-[var(--c-lavender)] transition-colors"
        />
        <button
          type="button"
          onClick={handleUpsert}
          disabled={!newCategory || !newRate}
          className="rounded-2xl bg-[var(--c-lavender)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-40"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}

// --- Expense Groups ---

function ExpenseGroupsSettings() {
  const { groups, isLoading, mutate } = useExpenseGroups();
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupCurrency, setNewGroupCurrency] = useState("RUB");
  const [newCategoryNames, setNewCategoryNames] = useState<Record<string, string>>({});

  if (isLoading) {
    return <SettingsLoader />;
  }

  async function handleAddGroup() {
    if (!newGroupName.trim()) return;
    const slug = newGroupName
      .trim()
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]+/gi, "-")
      .replace(/^-|-$/g, "");
    await fetch("/api/finances/expense-groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroupName.trim(), slug, currency: newGroupCurrency }),
    });
    setNewGroupName("");
    setNewGroupCurrency("RUB");
    mutate();
  }

  async function handleDeleteGroup(id: string) {
    await fetch(`/api/finances/expense-groups/${id}`, { method: "DELETE" });
    mutate();
  }

  async function handleAddCategory(groupId: string) {
    const name = newCategoryNames[groupId]?.trim();
    if (!name) return;
    await fetch(`/api/finances/expense-groups/${groupId}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setNewCategoryNames((prev) => ({ ...prev, [groupId]: "" }));
    mutate();
  }

  async function handleDeleteCategory(groupId: string, categoryId: string) {
    await fetch(`/api/finances/expense-groups/${groupId}/categories`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId }),
    });
    mutate();
  }

  return (
    <div className="space-y-4">
      {groups.map(
        (group: {
          id: string;
          name: string;
          slug: string;
          currency: string;
          categories: { id: string; name: string }[];
        }) => (
          <div key={group.id} className="rounded-3xl bg-[var(--c-gray)] p-4 md:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-extrabold uppercase">{group.name}</h3>
                <span className="rounded-full bg-white px-3 py-0.5 text-xs font-bold text-[#999]">
                  {group.currency}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteGroup(group.id)}
                className="rounded-full bg-[var(--c-coral)] px-3 py-1 text-xs font-bold text-white hover:opacity-80 transition-opacity cursor-pointer"
              >
                Удалить группу
              </button>
            </div>

            <div className="space-y-1.5">
              {group.categories.map((cat: { id: string; name: string }) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-2xl bg-white px-4 py-2.5"
                >
                  <span className="text-sm font-medium">{cat.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(group.id, cat.id)}
                    className="text-xs font-bold text-[var(--c-coral)] hover:opacity-60 transition-opacity cursor-pointer"
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryNames[group.id] ?? ""}
                onChange={(e) =>
                  setNewCategoryNames((prev) => ({ ...prev, [group.id]: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory(group.id)}
                placeholder="Новая категория..."
                className="flex-1 rounded-2xl border-2 border-[var(--c-black)]/10 bg-white px-4 py-2 text-sm font-medium outline-none focus:border-[var(--c-lavender)] transition-colors"
              />
              <button
                type="button"
                onClick={() => handleAddCategory(group.id)}
                disabled={!newCategoryNames[group.id]?.trim()}
                className="rounded-2xl bg-[var(--c-mint)] px-4 py-2 text-sm font-bold text-[var(--c-black)] hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-40"
              >
                Добавить
              </button>
            </div>
          </div>
        )
      )}

      {/* Add new group */}
      <div className="rounded-3xl border-2 border-dashed border-[var(--c-black)]/20 p-4 md:p-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-[#999]">
          Добавить группу расходов
        </h3>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddGroup()}
            placeholder="Название группы..."
            className="flex-1 min-w-[160px] rounded-2xl border-2 border-[var(--c-black)]/10 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-[var(--c-lavender)] transition-colors"
          />
          <select
            value={newGroupCurrency}
            onChange={(e) => setNewGroupCurrency(e.target.value)}
            className="rounded-2xl border-2 border-[var(--c-black)]/10 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-[var(--c-lavender)] transition-colors cursor-pointer"
          >
            <option value="RUB">RUB</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
          <button
            type="button"
            onClick={handleAddGroup}
            disabled={!newGroupName.trim()}
            className="rounded-2xl bg-[var(--c-lavender)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-40"
          >
            Создать группу
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsLoader() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--c-gray)] border-t-[var(--c-lavender)]" />
    </div>
  );
}
