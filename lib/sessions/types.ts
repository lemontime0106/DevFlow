import type {
  Category,
  DailyDashboardSummary,
  DailyGoal,
  FocusSession,
  InsightMessage,
  UserSettings,
  WeeklyCategoryBreakdown,
  WeeklyDayStat,
  WeeklyReportSummary,
  WeeklyTimeBlockStat,
} from "@/lib/types/domain";

export interface TimerPageData {
  activeSession: FocusSession | null;
  resumableSession: FocusSession | null;
  categories: Category[];
  settings: UserSettings | null;
}

export interface HistoryFilters {
  status?: string;
  categoryId?: string;
  date?: string;
}

export interface HistoryPageData {
  sessions: FocusSession[];
  categories: Category[];
}

export interface DashboardPageData {
  summary: DailyDashboardSummary;
  recentSessions: FocusSession[];
  categories: Category[];
  insight: InsightMessage | null;
}

export interface SettingsPageData {
  dailyGoal: DailyGoal | null;
  settings: UserSettings | null;
  goalDate: string;
  categories: Category[];
}

export interface WeeklyReportPageData {
  summary: WeeklyReportSummary;
  categoryBreakdown: WeeklyCategoryBreakdown[];
  timeBlocks: WeeklyTimeBlockStat[];
  dayStats: WeeklyDayStat[];
  recentCompletedSessions: FocusSession[];
  weekRangeLabel: string;
  insights: InsightMessage[];
}
