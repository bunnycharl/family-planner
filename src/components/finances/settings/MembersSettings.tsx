"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { BudgetYearData } from "@/lib/finances/types";

interface MembersSettingsProps {
  data: BudgetYearData;
  mutations: {
    createMember: (name: string) => Promise<void>;
    updateMember: (id: string, data: { name?: string; sortOrder?: number }) => Promise<void>;
    deleteMember: (id: string) => Promise<void>;
  };
}

export function MembersSettings({ data, mutations }: MembersSettingsProps) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function handleAdd() {
    if (!newName.trim()) return;
    try {
      await mutations.createMember(newName.trim());
      setNewName("");
      toast.success("Член семьи добавлен");
    } catch {
      toast.error("Ошибка при добавлении");
    }
  }

  async function handleRename(id: string) {
    if (!editName.trim()) return;
    try {
      await mutations.updateMember(id, { name: editName.trim() });
      setEditingId(null);
      toast.success("Имя обновлено");
    } catch {
      toast.error("Ошибка при обновлении");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Удалить «${name}»? Все доходы этого члена семьи будут удалены.`)) return;
    try {
      await mutations.deleteMember(id);
      toast.success("Удалено");
    } catch {
      toast.error("Ошибка при удалении");
    }
  }

  return (
    <div className="rounded-3xl bg-[var(--c-gray)] p-4 md:p-6 space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--c-black)]/40">
        Члены семьи
      </h3>

      <div className="space-y-2">
        {data.members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-2xl bg-white px-4 py-3"
          >
            {editingId === member.id ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => handleRename(member.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename(member.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                autoFocus
                className="flex-1 text-sm font-semibold outline-none"
              />
            ) : (
              <span
                className="text-sm font-semibold cursor-pointer hover:text-[var(--c-lavender)] transition-colors"
                onClick={() => {
                  setEditingId(member.id);
                  setEditName(member.name);
                }}
              >
                {member.name}
              </span>
            )}
            <button
              type="button"
              onClick={() => handleDelete(member.id, member.name)}
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
          placeholder="Новый член семьи..."
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
