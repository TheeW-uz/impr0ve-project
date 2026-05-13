'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  DailyGoal, DailyContainer,
  MonthlyGoal, MonthlyContainer,
  YearlyGoal, YearlyContainer,
  LifetimeGoal, Milestone, JournalEntry,
  CodingActivity,
  Subtask,
  Goal, Quest, TodoItem, CodingStat,
} from '@/types';
import { getDataStorageKey } from './data-persistence';

// ─── Key helpers ──────────────────────────────────────────────────────────────
export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function thisMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
export function thisYearKey(): string {
  return String(new Date().getFullYear());
}
export function displayDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
export function displayMonth(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// ─── Analytics helpers ────────────────────────────────────────────────────────
export function computeCodingStreak(activities: CodingActivity[]): { current: number; longest: number } {
  if (!activities.length) return { current: 0, longest: 0 };
  const days = Array.from(new Set(activities.map((a) => a.dateKey))).sort().reverse();
  if (!days.length) return { current: 0, longest: 0 };

  let current = 0;
  let longest = 0;
  let prev = todayKey();

  for (const day of days) {
    const diff = daysBetween(day, prev);
    if (diff <= 1) {
      current++;
      longest = Math.max(longest, current);
      prev = day;
    } else {
      break;
    }
  }
  // Longest pass
  let streak = 1;
  let longestAll = 1;
  for (let i = 1; i < days.length; i++) {
    if (daysBetween(days[i], days[i - 1]) === 1) {
      streak++;
      longestAll = Math.max(longestAll, streak);
    } else {
      streak = 1;
    }
  }
  return { current, longest: Math.max(longest, longestAll) };
}

function daysBetween(a: string, b: string): number {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return Math.abs(Math.round((dateB.getTime() - dateA.getTime()) / 86400000));
}

// ─── Store type ───────────────────────────────────────────────────────────────
type Store = {
  // NEW systems
  dailyGoals: DailyGoal[];
  dailyContainers: DailyContainer[];
  monthlyGoals: MonthlyGoal[];
  monthlyContainers: MonthlyContainer[];
  yearlyGoals: YearlyGoal[];
  yearlyContainers: YearlyContainer[];
  lifetimeGoals: LifetimeGoal[];
  codingActivities: CodingActivity[];

  // LEGACY
  goals: Goal[];
  quests: Quest[];
  todos: TodoItem[];
  coding: CodingStat[];

  // ── Container ensure (auto-create today/this-month/this-year) ──
  ensureTodayContainer: () => void;
  ensureMonthContainer: () => void;
  ensureYearContainer: () => void;

  // ── Daily Goal actions ──
  addDailyGoal: (goal: DailyGoal) => void;
  updateDailyGoal: (id: string, updates: Partial<DailyGoal>) => void;
  deleteDailyGoal: (id: string) => void;
  completeDailyGoal: (id: string) => void;
  failStaleDailyGoals: () => void;

  // ── Monthly Goal actions ──
  addMonthlyGoal: (goal: MonthlyGoal) => void;
  updateMonthlyGoal: (id: string, updates: Partial<MonthlyGoal>) => void;
  deleteMonthlyGoal: (id: string) => void;
  completeMonthlyGoal: (id: string) => void;

  // ── Yearly Goal actions ──
  addYearlyGoal: (goal: YearlyGoal) => void;
  updateYearlyGoal: (id: string, updates: Partial<YearlyGoal>) => void;
  deleteYearlyGoal: (id: string) => void;
  completeYearlyGoal: (id: string) => void;

  // ── Lifetime Goal actions ──
  addLifetimeGoal: (goal: LifetimeGoal) => void;
  updateLifetimeGoal: (id: string, updates: Partial<LifetimeGoal>) => void;
  deleteLifetimeGoal: (id: string) => void;
  addMilestone: (goalId: string, milestone: Milestone) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
  addJournalEntry: (goalId: string, entry: JournalEntry) => void;
  deleteJournalEntry: (goalId: string, entryId: string) => void;

  // ── Coding actions ──
  addCodingActivity: (activity: CodingActivity) => void;
  deleteCodingActivity: (id: string) => void;

  // ── Subtask actions (shared) ──
  addSubtask: (scope: 'daily' | 'monthly' | 'yearly', goalId: string, subtask: Subtask) => void;
  toggleSubtask: (scope: 'daily' | 'monthly' | 'yearly', goalId: string, subtaskId: string) => void;
  deleteSubtask: (scope: 'daily' | 'monthly' | 'yearly', goalId: string, subtaskId: string) => void;

  // LEGACY actions
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addQuest: (quest: Quest) => void;
  updateQuest: (id: string, updates: Partial<Quest>) => void;
  deleteQuest: (id: string) => void;
  addTodo: (todo: TodoItem) => void;
  updateTodo: (id: string, updates: Partial<TodoItem>) => void;
  deleteTodo: (id: string) => void;
  addCodingStat: (stat: CodingStat) => void;
  updateCodingStat: (id: string, updates: Partial<CodingStat>) => void;
  deleteCodingStat: (id: string) => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // ── State ──
      dailyGoals: [],
      dailyContainers: [],
      monthlyGoals: [],
      monthlyContainers: [],
      yearlyGoals: [],
      yearlyContainers: [],
      lifetimeGoals: [],
      codingActivities: [],
      goals: [],
      quests: [],
      todos: [],
      coding: [],

      // ── Ensure containers ──────────────────────────────────────────────────
      ensureTodayContainer: () => set((s) => {
        const key = todayKey();
        if (s.dailyContainers.find((c) => c.dateKey === key)) return {};
        return {
          dailyContainers: [
            ...s.dailyContainers,
            { dateKey: key, displayDate: displayDate(key), goals: [] },
          ],
        };
      }),

      ensureMonthContainer: () => set((s) => {
        const key = thisMonthKey();
        if (s.monthlyContainers.find((c) => c.monthKey === key)) return {};
        return {
          monthlyContainers: [
            ...s.monthlyContainers,
            { monthKey: key, displayMonth: displayMonth(key), goals: [] },
          ],
        };
      }),

      ensureYearContainer: () => set((s) => {
        const key = thisYearKey();
        if (s.yearlyContainers.find((c) => c.yearKey === key)) return {};
        return {
          yearlyContainers: [
            ...s.yearlyContainers,
            { yearKey: key, displayYear: key, goals: [] },
          ],
        };
      }),

      // ── Auto-fail stale daily goals ───────────────────────────────────────
      failStaleDailyGoals: () => set((s) => {
        const today = todayKey();
        const now = new Date().toISOString();
        const updated = s.dailyGoals.map((g) => {
          if (!g.completed && !g.failed && g.dateKey < today) {
            return { ...g, failed: true, failedAt: now };
          }
          return g;
        });
        return { dailyGoals: updated };
      }),

      // ── Daily Goal actions ────────────────────────────────────────────────
      addDailyGoal: (goal) => set((s) => {
        const containers = s.dailyContainers.map((c) =>
          c.dateKey === goal.dateKey
            ? { ...c, goals: [...c.goals, goal.id] }
            : c
        );
        return { dailyGoals: [...s.dailyGoals, goal], dailyContainers: containers };
      }),

      updateDailyGoal: (id, updates) => set((s) => ({
        dailyGoals: s.dailyGoals.map((g) => g.id === id ? { ...g, ...updates } : g),
      })),

      deleteDailyGoal: (id) => set((s) => {
        const goal = s.dailyGoals.find((g) => g.id === id);
        const containers = goal
          ? s.dailyContainers.map((c) =>
              c.dateKey === goal.dateKey
                ? { ...c, goals: c.goals.filter((gid) => gid !== id) }
                : c
            )
          : s.dailyContainers;
        return {
          dailyGoals: s.dailyGoals.filter((g) => g.id !== id),
          dailyContainers: containers,
        };
      }),

      completeDailyGoal: (id) => set((s) => ({
        dailyGoals: s.dailyGoals.map((g) =>
          g.id === id
            ? { ...g, completed: true, failed: false, completedAt: new Date().toISOString(), progress: 100 }
            : g
        ),
      })),

      // ── Monthly Goal actions ──────────────────────────────────────────────
      addMonthlyGoal: (goal) => set((s) => {
        const containers = s.monthlyContainers.map((c) =>
          c.monthKey === goal.monthKey
            ? { ...c, goals: [...c.goals, goal.id] }
            : c
        );
        return { monthlyGoals: [...s.monthlyGoals, goal], monthlyContainers: containers };
      }),

      updateMonthlyGoal: (id, updates) => set((s) => ({
        monthlyGoals: s.monthlyGoals.map((g) => g.id === id ? { ...g, ...updates } : g),
      })),

      deleteMonthlyGoal: (id) => set((s) => {
        const goal = s.monthlyGoals.find((g) => g.id === id);
        const containers = goal
          ? s.monthlyContainers.map((c) =>
              c.monthKey === goal.monthKey
                ? { ...c, goals: c.goals.filter((gid) => gid !== id) }
                : c
            )
          : s.monthlyContainers;
        return {
          monthlyGoals: s.monthlyGoals.filter((g) => g.id !== id),
          monthlyContainers: containers,
        };
      }),

      completeMonthlyGoal: (id) => set((s) => ({
        monthlyGoals: s.monthlyGoals.map((g) =>
          g.id === id
            ? { ...g, completed: true, failed: false, completedAt: new Date().toISOString(), progress: 100 }
            : g
        ),
      })),

      // ── Yearly Goal actions ───────────────────────────────────────────────
      addYearlyGoal: (goal) => set((s) => {
        const containers = s.yearlyContainers.map((c) =>
          c.yearKey === goal.yearKey
            ? { ...c, goals: [...c.goals, goal.id] }
            : c
        );
        return { yearlyGoals: [...s.yearlyGoals, goal], yearlyContainers: containers };
      }),

      updateYearlyGoal: (id, updates) => set((s) => ({
        yearlyGoals: s.yearlyGoals.map((g) => g.id === id ? { ...g, ...updates } : g),
      })),

      deleteYearlyGoal: (id) => set((s) => {
        const goal = s.yearlyGoals.find((g) => g.id === id);
        const containers = goal
          ? s.yearlyContainers.map((c) =>
              c.yearKey === goal.yearKey
                ? { ...c, goals: c.goals.filter((gid) => gid !== id) }
                : c
            )
          : s.yearlyContainers;
        return {
          yearlyGoals: s.yearlyGoals.filter((g) => g.id !== id),
          yearlyContainers: containers,
        };
      }),

      completeYearlyGoal: (id) => set((s) => ({
        yearlyGoals: s.yearlyGoals.map((g) =>
          g.id === id
            ? { ...g, completed: true, failed: false, completedAt: new Date().toISOString(), progress: 100 }
            : g
        ),
      })),

      // ── Lifetime Goal actions ─────────────────────────────────────────────
      addLifetimeGoal: (goal) => set((s) => ({ lifetimeGoals: [...s.lifetimeGoals, goal] })),
      updateLifetimeGoal: (id, updates) => set((s) => ({
        lifetimeGoals: s.lifetimeGoals.map((g) => g.id === id ? { ...g, ...updates } : g),
      })),
      deleteLifetimeGoal: (id) => set((s) => ({
        lifetimeGoals: s.lifetimeGoals.filter((g) => g.id !== id),
      })),

      addMilestone: (goalId, milestone) => set((s) => ({
        lifetimeGoals: s.lifetimeGoals.map((g) =>
          g.id === goalId ? { ...g, milestones: [...g.milestones, milestone] } : g
        ),
      })),

      toggleMilestone: (goalId, milestoneId) => set((s) => ({
        lifetimeGoals: s.lifetimeGoals.map((g) =>
          g.id === goalId
            ? {
                ...g,
                milestones: g.milestones.map((m) =>
                  m.id === milestoneId
                    ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString() : undefined }
                    : m
                ),
              }
            : g
        ),
      })),

      deleteMilestone: (goalId, milestoneId) => set((s) => ({
        lifetimeGoals: s.lifetimeGoals.map((g) =>
          g.id === goalId
            ? { ...g, milestones: g.milestones.filter((m) => m.id !== milestoneId) }
            : g
        ),
      })),

      addJournalEntry: (goalId, entry) => set((s) => ({
        lifetimeGoals: s.lifetimeGoals.map((g) =>
          g.id === goalId ? { ...g, journal: [...g.journal, entry] } : g
        ),
      })),

      deleteJournalEntry: (goalId, entryId) => set((s) => ({
        lifetimeGoals: s.lifetimeGoals.map((g) =>
          g.id === goalId
            ? { ...g, journal: g.journal.filter((j) => j.id !== entryId) }
            : g
        ),
      })),

      // ── Coding Activity actions ───────────────────────────────────────────
      addCodingActivity: (activity) => set((s) => ({
        codingActivities: [...s.codingActivities, activity],
      })),
      deleteCodingActivity: (id) => set((s) => ({
        codingActivities: s.codingActivities.filter((a) => a.id !== id),
      })),

      // ── Subtask actions ───────────────────────────────────────────────────
      addSubtask: (scope, goalId, subtask) => set((s) => {
        if (scope === 'daily') return {
          dailyGoals: s.dailyGoals.map((g) =>
            g.id === goalId ? { ...g, subtasks: [...g.subtasks, subtask] } : g
          ),
        };
        if (scope === 'monthly') return {
          monthlyGoals: s.monthlyGoals.map((g) =>
            g.id === goalId ? { ...g, subtasks: [...g.subtasks, subtask] } : g
          ),
        };
        return {
          yearlyGoals: s.yearlyGoals.map((g) =>
            g.id === goalId ? { ...g, subtasks: [...g.subtasks, subtask] } : g
          ),
        };
      }),

      toggleSubtask: (scope, goalId, subtaskId) => set((s) => {
        const toggle = (subtasks: Subtask[]) =>
          subtasks.map((st) =>
            st.id === subtaskId
              ? { ...st, completed: !st.completed, completedAt: !st.completed ? new Date().toISOString() : undefined }
              : st
          );
        if (scope === 'daily') return {
          dailyGoals: s.dailyGoals.map((g) =>
            g.id === goalId ? { ...g, subtasks: toggle(g.subtasks) } : g
          ),
        };
        if (scope === 'monthly') return {
          monthlyGoals: s.monthlyGoals.map((g) =>
            g.id === goalId ? { ...g, subtasks: toggle(g.subtasks) } : g
          ),
        };
        return {
          yearlyGoals: s.yearlyGoals.map((g) =>
            g.id === goalId ? { ...g, subtasks: toggle(g.subtasks) } : g
          ),
        };
      }),

      deleteSubtask: (scope, goalId, subtaskId) => set((s) => {
        const del = (subtasks: Subtask[]) => subtasks.filter((st) => st.id !== subtaskId);
        if (scope === 'daily') return {
          dailyGoals: s.dailyGoals.map((g) =>
            g.id === goalId ? { ...g, subtasks: del(g.subtasks) } : g
          ),
        };
        if (scope === 'monthly') return {
          monthlyGoals: s.monthlyGoals.map((g) =>
            g.id === goalId ? { ...g, subtasks: del(g.subtasks) } : g
          ),
        };
        return {
          yearlyGoals: s.yearlyGoals.map((g) =>
            g.id === goalId ? { ...g, subtasks: del(g.subtasks) } : g
          ),
        };
      }),

      // ── LEGACY actions ────────────────────────────────────────────────────
      addGoal: (goal) => set((s) => ({ goals: [...s.goals, goal] })),
      updateGoal: (id, updates) => set((s) => ({
        goals: s.goals.map((g) => g.id === id ? { ...g, ...updates } : g),
      })),
      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      addQuest: (quest) => set((s) => ({ quests: [...s.quests, quest] })),
      updateQuest: (id, updates) => set((s) => ({
        quests: s.quests.map((q) => q.id === id ? { ...q, ...updates } : q),
      })),
      deleteQuest: (id) => set((s) => ({ quests: s.quests.filter((q) => q.id !== id) })),

      addTodo: (todo) => set((s) => ({ todos: [...s.todos, todo] })),
      updateTodo: (id, updates) => set((s) => ({
        todos: s.todos.map((t) => t.id === id ? { ...t, ...updates } : t),
      })),
      deleteTodo: (id) => set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),

      addCodingStat: (stat) => set((s) => ({ coding: [...s.coding, stat] })),
      updateCodingStat: (id, updates) => set((s) => ({
        coding: s.coding.map((c) => c.id === id ? { ...c, ...updates } : c),
      })),
      deleteCodingStat: (id) => set((s) => ({ coding: s.coding.filter((c) => c.id !== id) })),
    }),
    {
      name: getDataStorageKey(),
      storage: createJSONStorage(() => localStorage),
    }
  )
);
