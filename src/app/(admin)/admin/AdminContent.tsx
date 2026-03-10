"use client";

import { useState, type FormEvent } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { ColorPicker } from "@/components/ui/ColorPicker";

interface FamilyUser {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  isAdmin: boolean;
}

interface Family {
  id: string;
  name: string;
  createdAt: string;
  users: FamilyUser[];
  _count: { users: number };
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function AdminContent() {
  const { data: families, isLoading, mutate } = useSWR<Family[]>("/api/admin/families", fetcher);

  const [newFamilyName, setNewFamilyName] = useState("");
  const [isCreatingFamily, setIsCreatingFamily] = useState(false);

  const [addUserFamilyId, setAddUserFamilyId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userColor, setUserColor] = useState("#6366f1");
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Change password state
  const [changePwdUserId, setChangePwdUserId] = useState<string | null>(null);
  const [changePwdFamilyId, setChangePwdFamilyId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  // Delete state
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  async function handleCreateFamily(e: FormEvent) {
    e.preventDefault();
    if (!newFamilyName.trim()) return;
    setIsCreatingFamily(true);
    try {
      const res = await fetch("/api/admin/families", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFamilyName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Ошибка создания семьи");
      }
      toast.success("Семья создана");
      setNewFamilyName("");
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка создания семьи");
    } finally {
      setIsCreatingFamily(false);
    }
  }

  function openAddUser(familyId: string) {
    setAddUserFamilyId(familyId);
    setUserName("");
    setUserEmail("");
    setUserPassword("");
    setUserColor("#6366f1");
    setChangePwdUserId(null);
  }

  function closeAddUser() {
    setAddUserFamilyId(null);
  }

  async function handleAddUser(e: FormEvent, familyId: string) {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim() || !userPassword.trim()) return;
    setIsCreatingUser(true);
    try {
      const res = await fetch(`/api/admin/families/${familyId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName.trim(),
          email: userEmail.trim(),
          password: userPassword,
          avatarColor: userColor,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        const detail = data.issues?.[0]
          ? `${data.issues[0].path.join(".")}: ${data.issues[0].message}`
          : null;
        throw new Error(detail ?? data.error ?? "Ошибка создания пользователя");
      }
      toast.success("Участник добавлен");
      closeAddUser();
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка создания пользователя");
    } finally {
      setIsCreatingUser(false);
    }
  }

  function openChangePwd(familyId: string, userId: string) {
    setChangePwdUserId(userId);
    setChangePwdFamilyId(familyId);
    setNewPassword("");
    setAddUserFamilyId(null);
  }

  function closeChangePwd() {
    setChangePwdUserId(null);
    setChangePwdFamilyId(null);
    setNewPassword("");
  }

  async function handleChangePwd(e: FormEvent) {
    e.preventDefault();
    if (!newPassword.trim() || !changePwdUserId || !changePwdFamilyId) return;
    setIsChangingPwd(true);
    try {
      const res = await fetch(`/api/admin/families/${changePwdFamilyId}/users/${changePwdUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Ошибка смены пароля");
      }
      toast.success("Пароль изменён");
      closeChangePwd();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка смены пароля");
    } finally {
      setIsChangingPwd(false);
    }
  }

  async function handleDeleteUser(familyId: string, userId: string, userName: string) {
    if (!confirm(`Удалить участника «${userName}»? Это действие нельзя отменить.`)) return;
    setDeletingUserId(userId);
    try {
      const res = await fetch(`/api/admin/families/${familyId}/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Ошибка удаления пользователя");
      }
      toast.success("Участник удалён");
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка удаления пользователя");
    } finally {
      setDeletingUserId(null);
    }
  }

  const membersWord = (n: number) => {
    if (n === 1) return "участник";
    if (n < 5) return "участника";
    return "участников";
  };

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="bg-white border-b border-[var(--c-gray)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-[var(--c-black)] text-white px-3 py-1.5 rounded-xl text-sm font-extrabold uppercase">
            Family
          </span>
          <span className="text-sm font-bold uppercase text-[#999]">Admin Panel</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-full border-2 border-[var(--c-black)] px-4 py-1.5 text-xs font-bold uppercase text-[var(--c-black)] hover:bg-[var(--c-black)] hover:text-white transition-all cursor-pointer"
        >
          Выйти
        </button>
      </header>

      {/* Content */}
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-[var(--c-black)]">
          <span className="bg-[var(--c-coral)] px-4 py-1 rounded-xl inline-block text-white">
            Управление доступом
          </span>
        </h1>

        {/* Create family */}
        <section className="bg-white rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-[var(--c-black)] text-white rounded-full px-3 py-1 text-xs font-bold uppercase">
              Новая семья
            </span>
          </div>
          <form onSubmit={handleCreateFamily} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold uppercase tracking-wide text-[#999] mb-1.5">
                Название
              </label>
              <input
                type="text"
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                placeholder="Например: Семья Ивановых"
                className={cn(
                  "w-full rounded-2xl border-2 border-[var(--c-black)] bg-[var(--c-gray)] px-4 py-3 text-sm font-medium",
                  "text-[var(--c-black)] placeholder:text-[#bbb]",
                  "focus:outline-none focus:bg-white transition-colors"
                )}
              />
            </div>
            <button
              type="submit"
              disabled={isCreatingFamily || !newFamilyName.trim()}
              className={cn(
                "rounded-full px-6 py-3 text-sm font-bold uppercase cursor-pointer",
                "text-white bg-[var(--c-black)] hover:opacity-80 transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isCreatingFamily ? "Создание..." : "Создать"}
            </button>
          </form>
        </section>

        {/* Families list */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="bg-[var(--c-black)] text-white rounded-full px-3 py-1 text-xs font-bold uppercase">
              Все семьи
            </span>
            {families && (
              <span className="text-xs font-bold uppercase text-[#999]">{families.length}</span>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--c-gray)] border-t-[var(--c-lavender)]" />
            </div>
          ) : families && families.length > 0 ? (
            families.map((family) => (
              <div key={family.id} className="bg-white rounded-3xl p-5 md:p-6 shadow-sm">
                {/* Family header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-extrabold uppercase text-[var(--c-black)]">
                      {family.name}
                    </h2>
                    <p className="text-xs text-[#999] mt-0.5">
                      {family._count.users} {membersWord(family._count.users)}
                    </p>
                  </div>
                  {addUserFamilyId !== family.id && (
                    <button
                      type="button"
                      onClick={() => openAddUser(family.id)}
                      className={cn(
                        "rounded-full px-5 py-2.5 text-xs font-bold uppercase cursor-pointer",
                        "text-white bg-[var(--c-black)] hover:opacity-80 transition-all"
                      )}
                    >
                      + Участник
                    </button>
                  )}
                </div>

                {/* Members list */}
                {family.users.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {family.users.map((user) => (
                      <div key={user.id} className="rounded-2xl bg-[var(--c-gray)] overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-3">
                          <span
                            className="inline-block h-8 w-8 rounded-full shrink-0"
                            style={{ backgroundColor: user.avatarColor }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold uppercase text-[var(--c-black)] truncate">
                              {user.name}
                              {user.isAdmin && (
                                <span className="ml-2 text-[10px] font-bold uppercase bg-[var(--c-coral)] text-white rounded-full px-2 py-0.5">
                                  Админ
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-[#999] truncate">{user.email}</p>
                          </div>
                          {!user.isAdmin && (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  changePwdUserId === user.id
                                    ? closeChangePwd()
                                    : openChangePwd(family.id, user.id)
                                }
                                className="rounded-full border-2 border-[var(--c-black)] px-3 py-1 text-[10px] font-bold uppercase text-[var(--c-black)] hover:bg-[var(--c-black)]/5 transition-all cursor-pointer"
                              >
                                Пароль
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(family.id, user.id, user.name)}
                                disabled={deletingUserId === user.id}
                                className="rounded-full border-2 border-red-400 px-3 py-1 text-[10px] font-bold uppercase text-red-500 hover:bg-red-50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingUserId === user.id ? "..." : "Удалить"}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Change password inline form */}
                        {changePwdUserId === user.id && changePwdFamilyId === family.id && (
                          <form
                            onSubmit={handleChangePwd}
                            className="border-t-2 border-white px-4 py-3 flex flex-wrap items-end gap-3"
                          >
                            <div className="flex-1 min-w-[180px]">
                              <label className="block text-xs font-bold uppercase tracking-wide text-[#999] mb-1.5">
                                Новый пароль
                              </label>
                              <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Введите новый пароль"
                                autoFocus
                                className={cn(
                                  "w-full rounded-2xl border-2 border-[var(--c-black)] bg-white px-4 py-2.5 text-sm font-medium",
                                  "text-[var(--c-black)] placeholder:text-[#bbb] focus:outline-none transition-colors"
                                )}
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={isChangingPwd || !newPassword.trim()}
                                className={cn(
                                  "rounded-full px-5 py-2.5 text-xs font-bold uppercase cursor-pointer",
                                  "text-white bg-[var(--c-black)] hover:opacity-80 transition-all",
                                  "disabled:opacity-50 disabled:cursor-not-allowed"
                                )}
                              >
                                {isChangingPwd ? "Сохранение..." : "Сохранить"}
                              </button>
                              <button
                                type="button"
                                onClick={closeChangePwd}
                                className="rounded-full border-2 border-[var(--c-black)] px-5 py-2.5 text-xs font-bold uppercase text-[var(--c-black)] hover:bg-[var(--c-black)]/5 transition-all cursor-pointer"
                              >
                                Отмена
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add user form inline */}
                {addUserFamilyId === family.id && (
                  <form
                    onSubmit={(e) => handleAddUser(e, family.id)}
                    className="border-t-2 border-[var(--c-gray)] pt-4 space-y-4"
                  >
                    <h3 className="text-sm font-bold uppercase text-[var(--c-black)]">
                      Новый участник
                    </h3>

                    <div className="flex flex-wrap gap-3">
                      <div className="flex-1 min-w-[150px]">
                        <label className="block text-xs font-bold uppercase tracking-wide text-[#999] mb-1.5">
                          Имя
                        </label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Имя"
                          className={cn(
                            "w-full rounded-2xl border-2 border-[var(--c-black)] bg-[var(--c-gray)] px-4 py-3 text-sm font-medium",
                            "text-[var(--c-black)] placeholder:text-[#bbb] focus:outline-none focus:bg-white transition-colors"
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <label className="block text-xs font-bold uppercase tracking-wide text-[#999] mb-1.5">
                          Логин
                        </label>
                        <input
                          type="text"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          placeholder="Любой логин"
                          className={cn(
                            "w-full rounded-2xl border-2 border-[var(--c-black)] bg-[var(--c-gray)] px-4 py-3 text-sm font-medium",
                            "text-[var(--c-black)] placeholder:text-[#bbb] focus:outline-none focus:bg-white transition-colors"
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <label className="block text-xs font-bold uppercase tracking-wide text-[#999] mb-1.5">
                          Пароль
                        </label>
                        <input
                          type="password"
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                          placeholder="Минимум 6 символов"
                          className={cn(
                            "w-full rounded-2xl border-2 border-[var(--c-black)] bg-[var(--c-gray)] px-4 py-3 text-sm font-medium",
                            "text-[var(--c-black)] placeholder:text-[#bbb] focus:outline-none focus:bg-white transition-colors"
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-[#999] mb-2">
                        Цвет аватара
                      </label>
                      <ColorPicker value={userColor} onChange={setUserColor} />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={
                          isCreatingUser ||
                          !userName.trim() ||
                          !userEmail.trim() ||
                          !userPassword.trim()
                        }
                        className={cn(
                          "rounded-full px-6 py-3 text-sm font-bold uppercase cursor-pointer",
                          "text-white bg-[var(--c-black)] hover:opacity-80 transition-all",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        {isCreatingUser ? "Создание..." : "Добавить"}
                      </button>
                      <button
                        type="button"
                        onClick={closeAddUser}
                        className="rounded-full border-2 border-[var(--c-black)] px-6 py-3 text-sm font-bold uppercase text-[var(--c-black)] hover:bg-[var(--c-black)]/5 transition-all cursor-pointer"
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
              <p className="text-sm font-bold uppercase text-[#999]">Семей пока нет</p>
              <p className="text-xs text-[#bbb] mt-1">Создайте первую семью выше</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
