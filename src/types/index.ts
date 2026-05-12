// src/types/index.ts

// ─── Subtask ──────────────────────────────────────────
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string; // ISO
}

// ─── Daily Goal ───────────────────────────────────────
export interface DailyGoal {
  id: string;
  dateKey: string; // "2026-05-12"
  title: string;
  notes: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  progress: number; // 0-100 (manually set)
  completed: boolean;
  failed: boolean; // auto-set when day ends without completion
  completedAt?: string; // real ISO timestamp
  failedAt?: string; // ISO timestamp when auto-failed
  createdAt: string; // ISO
  timeEstimateMinutes: number;
  subtasks: Subtask[];
}

// ─── Daily Container ──────────────────────────────────
export interface DailyContainer {
  dateKey: string; // "2026-05-12"
  displayDate: string; // "May 12, 2026"
  goals: string[]; // goal IDs
}

// ─── Monthly Goal ─────────────────────────────────────
export interface MonthlyGoal {
  id: string;
  monthKey: string; // "2026-05"
  title: string;
  notes: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  progress: number; // 0-100
  completed: boolean;
  failed: boolean;
  completedAt?: string;
  failedAt?: string;
  createdAt: string;
  subtasks: Subtask[];
}

// ─── Monthly Container ────────────────────────────────
export interface MonthlyContainer {
  monthKey: string; // "2026-05"
  displayMonth: string; // "May 2026"
  goals: string[];
}

// ─── Yearly Goal ──────────────────────────────────────
export interface YearlyGoal {
  id: string;
  yearKey: string; // "2026"
  title: string;
  notes: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  progress: number; // 0-100
  completed: boolean;
  failed: boolean;
  completedAt?: string;
  failedAt?: string;
  createdAt: string;
  subtasks: Subtask[];
}

// ─── Yearly Container ─────────────────────────────────
export interface YearlyContainer {
  yearKey: string; // "2026"
  displayYear: string; // "2026"
  goals: string[];
}

// ─── Lifetime Goal Milestone ──────────────────────────
export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  targetDate?: string;
}

// ─── Lifetime Goal Journal Entry ──────────────────────
export interface JournalEntry {
  id: string;
  date: string; // ISO
  content: string;
  progressSnapshot: number; // progress at time of entry
}

// ─── Lifetime Goal ────────────────────────────────────
export interface LifetimeGoal {
  id: string;
  title: string;
  notes: string;
  progress: number; // 0-100
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  milestones: Milestone[];
  journal: JournalEntry[];
  estimatedYears?: number;
  category: string; // "Career", "Financial", "Health", etc.
}

// ─── Coding Activity ──────────────────────────────────
export interface CodingActivity {
  id: string;
  dateKey: string; // "2026-05-12"
  title: string;
  description: string;
  minutesSpent: number;
  language?: string;
  createdAt: string;
}

// ─── Legacy types (kept for backward compat) ──────────
export interface Goal {
  id: string;
  title: string;
  notes?: string;
  deadline?: string;
  priority: 'Low' | 'Medium' | 'High';
  category: 'Daily' | 'Monthly' | 'Yearly' | 'Lifetime';
  progress: number;
  completed: boolean;
  history: { date: string; progress: number }[];
}

export interface Quest {
  id: string;
  title: string;
  totalDays: number;
  completedDays: number;
  completed: boolean;
  startDate?: string;
  notes?: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  milestones?: { id: string; title: string; completed: boolean }[];
  children?: RoadmapItem[];
}

export interface TodoItem {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  favorite?: boolean;
}

export interface CodingStat {
  id: string;
  title: string;
  progress: number;
  goal?: string;
  notes?: string;
}
