import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";
import type {
  Category,
  DailyDashboardSummary,
  FocusSession,
  InsightMessage,
} from "@/lib/types/domain";
import type {
  DashboardPageData,
  HistoryFilters,
  HistoryPageData,
  TimerPageData,
} from "@/lib/sessions/types";

type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    color: row.color,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSession(row: SessionRow): FocusSession {
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    title: row.title,
    memo: row.memo,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    focusMinutes: row.focus_minutes,
    breakMinutes: row.break_minutes,
    plannedMinutes: row.planned_minutes,
    actualMinutes: row.actual_minutes,
    status: row.status as FocusSession["status"],
    difficulty: row.difficulty as FocusSession["difficulty"],
    selfRating: row.self_rating,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getDayRange(baseDate = new Date()) {
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(baseDate);
  end.setHours(23, 59, 59, 999);

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

function getBestTimeBlock(sessions: FocusSession[]) {
  const buckets = new Map<string, number>();

  for (const session of sessions) {
    const hour = new Date(session.startedAt).getHours();
    const label =
      hour < 12 ? "오전" : hour < 18 ? "오후" : "저녁";
    buckets.set(label, (buckets.get(label) ?? 0) + (session.actualMinutes ?? 0));
  }

  return [...buckets.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function buildInsight(
  completedToday: FocusSession[],
  topCategoryName: string | null,
): InsightMessage | null {
  const totalMinutes = completedToday.reduce(
    (sum, session) => sum + (session.actualMinutes ?? 0),
    0,
  );

  if (completedToday.length === 0) {
    return {
      kind: "focus-level",
      title: "첫 세션을 시작해 보세요",
      summary: "오늘 세션이 아직 없습니다. 25분 집중 세션 하나부터 쌓아보면 대시보드가 살아납니다.",
    };
  }

  if (totalMinutes >= 180) {
    return {
      kind: "focus-level",
      title: "집중 페이스가 좋습니다",
      summary: `오늘 ${Math.round(totalMinutes / 60)}시간 이상 기록했습니다. ${topCategoryName ?? "핵심 작업"} 중심의 흐름이 안정적으로 쌓이고 있습니다.`,
    };
  }

  return {
    kind: "routine",
    title: "루틴을 조금 더 쌓아볼 차례입니다",
    summary: `오늘 ${completedToday.length}개의 세션을 완료했습니다. 한두 세션만 더 쌓이면 시간대 패턴이 더 선명해집니다.`,
  };
}

export async function getCategoriesForUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .order("is_default", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapCategory);
}

export async function getTimerPageData(userId: string): Promise<TimerPageData> {
  const supabase = await createClient();
  const [categories, activeSessionResult] = await Promise.all([
    getCategoriesForUser(userId),
    supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (activeSessionResult.error) {
    throw new Error(activeSessionResult.error.message);
  }

  return {
    categories,
    activeSession: activeSessionResult.data
      ? mapSession(activeSessionResult.data)
      : null,
  };
}

export async function getHistoryPageData(
  userId: string,
  filters: HistoryFilters,
): Promise<HistoryPageData> {
  const supabase = await createClient();
  let query = supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(100);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.categoryId && filters.categoryId !== "all") {
    query = query.eq("category_id", filters.categoryId);
  }

  if (filters.date) {
    query = query
      .gte("started_at", `${filters.date}T00:00:00.000Z`)
      .lte("started_at", `${filters.date}T23:59:59.999Z`);
  }

  const [{ data: sessions, error }, categories] = await Promise.all([
    query,
    getCategoriesForUser(userId),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return {
    sessions: (sessions ?? []).map(mapSession),
    categories,
  };
}

export async function getDashboardPageData(
  userId: string,
): Promise<DashboardPageData> {
  const supabase = await createClient();
  const today = getDayRange();
  const yesterday = getDayRange(
    new Date(Date.now() - 24 * 60 * 60 * 1000),
  );

  const [todayResult, yesterdayResult, recentResult, categories] = await Promise.all([
    supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("started_at", today.startIso)
      .lte("started_at", today.endIso)
      .order("started_at", { ascending: false }),
    supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("started_at", yesterday.startIso)
      .lte("started_at", yesterday.endIso)
      .order("started_at", { ascending: false }),
    supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(5),
    getCategoriesForUser(userId),
  ]);

  if (todayResult.error) {
    throw new Error(todayResult.error.message);
  }

  if (recentResult.error) {
    throw new Error(recentResult.error.message);
  }

  if (yesterdayResult.error) {
    throw new Error(yesterdayResult.error.message);
  }

  const todaySessions = (todayResult.data ?? []).map(mapSession);
  const yesterdaySessions = (yesterdayResult.data ?? []).map(mapSession);
  const recentSessions = (recentResult.data ?? []).map(mapSession);
  const completedToday = todaySessions.filter(
    (session) => session.status === "completed",
  );
  const completedYesterday = yesterdaySessions.filter(
    (session) => session.status === "completed",
  );

  const totalFocusMinutes = completedToday.reduce(
    (sum, session) => sum + (session.actualMinutes ?? 0),
    0,
  );
  const yesterdayFocusMinutes = completedYesterday.reduce(
    (sum, session) => sum + (session.actualMinutes ?? 0),
    0,
  );
  const completedSessions = completedToday.length;

  const categoryMinutes = new Map<string, number>();
  for (const session of completedToday) {
    if (!session.categoryId) continue;
    categoryMinutes.set(
      session.categoryId,
      (categoryMinutes.get(session.categoryId) ?? 0) +
        (session.actualMinutes ?? 0),
    );
  }

  const topCategoryId = [...categoryMinutes.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];
  const topCategoryName =
    categories.find((category) => category.id === topCategoryId)?.name ?? null;
  const bestTimeBlock = getBestTimeBlock(completedToday);

  const summary: DailyDashboardSummary = {
    totalFocusMinutes,
    completedSessions,
    topCategoryName,
    bestTimeBlock,
    changeFromYesterdayPercent:
      yesterdayFocusMinutes > 0
        ? Math.round(
            ((totalFocusMinutes - yesterdayFocusMinutes) /
              yesterdayFocusMinutes) *
              100,
          )
        : totalFocusMinutes > 0
          ? 100
          : 0,
    insightSummary: null,
  };

  const insight = buildInsight(completedToday, topCategoryName);
  summary.insightSummary = insight?.summary ?? null;

  return {
    summary,
    recentSessions,
    categories,
    insight,
  };
}
