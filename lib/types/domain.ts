export type SessionStatus = "completed" | "cancelled" | "interrupted" | "active";

export type SessionDifficulty = "easy" | "normal" | "hard";

export type AppRouteId =
  | "landing"
  | "login"
  | "sign-up"
  | "dashboard"
  | "timer"
  | "history"
  | "weekly-report"
  | "settings";

export type InsightKind =
  | "focus-level"
  | "time-block"
  | "routine"
  | "category-bias"
  | "session-stamina"
  | "trend";

export interface Category {
  id: string;
  userId: string | null;
  name: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  categoryId: string | null;
  title: string;
  memo: string | null;
  startedAt: string;
  endedAt: string | null;
  focusMinutes: number;
  breakMinutes: number;
  plannedMinutes: number;
  actualMinutes: number | null;
  status: SessionStatus;
  difficulty: SessionDifficulty | null;
  selfRating: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimerPreset {
  id: string;
  label: string;
  focusMinutes: number;
  breakMinutes: number;
  isDefault: boolean;
}

export interface SessionDraft {
  title: string;
  categoryId: string | null;
  difficulty: SessionDifficulty | null;
  selfRating: number | null;
  memo: string;
}

export interface DailyGoal {
  id: string;
  userId: string;
  goalDate: string;
  targetFocusMinutes: number;
  targetSessions: number;
  targetDaysPerWeek: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyDashboardSummary {
  totalFocusMinutes: number;
  completedSessions: number;
  topCategoryName: string | null;
  bestTimeBlock: string | null;
  changeFromYesterdayPercent: number | null;
  goalFocusMinutes: number | null;
  goalSessions: number | null;
  focusGoalProgressPercent: number | null;
  sessionGoalProgressPercent: number | null;
  insightSummary?: string | null;
}

export interface WeeklyCategoryBreakdown {
  categoryId: string | null;
  categoryName: string;
  categoryColor: string | null;
  totalMinutes: number;
  share: number;
}

export interface WeeklyTimeBlockStat {
  label: string;
  totalMinutes: number;
  sessions: number;
  averageRating: number | null;
  completionRate: number | null;
}

export interface WeeklyDayStat {
  label: string;
  date: string;
  totalMinutes: number;
  sessions: number;
}

export interface WeeklyReportSummary {
  totalFocusMinutes: number;
  totalSessions: number;
  averageSessionMinutes: number;
  goalAchievementRate: number | null;
  topCategoryName: string | null;
  bestTimeBlock: string | null;
  interruptionRate: number | null;
  longestFocusStreakDays: number;
  categorySwitchCount: number;
}

export interface InsightMessage {
  kind: InsightKind;
  title: string;
  summary: string;
  score?: number;
}
