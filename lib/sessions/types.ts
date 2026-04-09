import type {
  Category,
  DailyDashboardSummary,
  FocusSession,
  InsightMessage,
} from "@/lib/types/domain";

export interface TimerPageData {
  activeSession: FocusSession | null;
  categories: Category[];
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
