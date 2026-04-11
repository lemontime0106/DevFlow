import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";
import type {
  Category,
  DailyDashboardSummary,
  DailyGoal,
  FocusSession,
  InsightMessage,
} from "@/lib/types/domain";
import type {
  DashboardPageData,
  HistoryFilters,
  HistoryPageData,
  SettingsPageData,
  TimerPageData,
  WeeklyReportPageData,
} from "@/lib/sessions/types";

type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type DailyGoalRow = Database["public"]["Tables"]["daily_goals"]["Row"];

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

function mapDailyGoal(row: DailyGoalRow): DailyGoal {
  return {
    id: row.id,
    userId: row.user_id,
    goalDate: row.goal_date,
    targetFocusMinutes: row.target_focus_minutes,
    targetSessions: row.target_sessions,
    targetDaysPerWeek: row.target_days_per_week,
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

function getGoalDate(baseDate = new Date()) {
  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, "0");
  const day = String(baseDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateRangeLabel(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function getWeekRange(baseDate = new Date()) {
  const end = new Date(baseDate);
  end.setHours(23, 59, 59, 999);

  const start = new Date(baseDate);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  return {
    start,
    end,
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

function getLongestFocusStreak(dayStats: WeeklyReportPageData["dayStats"]) {
  let longest = 0;
  let current = 0;

  for (const day of dayStats) {
    if (day.totalMinutes > 0) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
}

function getCategorySwitchCount(sessions: FocusSession[]) {
  const orderedSessions = [...sessions].sort(
    (a, b) =>
      new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
  );

  let switches = 0;
  for (let index = 1; index < orderedSessions.length; index += 1) {
    const previous = orderedSessions[index - 1];
    const current = orderedSessions[index];
    if (previous.categoryId !== current.categoryId) {
      switches += 1;
    }
  }

  return switches;
}

function buildDailyInsight(
  completedToday: FocusSession[],
  topCategoryName: string | null,
  goalProgressPercent: number | null,
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

  if (goalProgressPercent !== null && goalProgressPercent >= 100) {
    return {
      kind: "trend",
      title: "오늘 목표를 달성했습니다",
      summary: `집중 시간 목표를 넘어섰습니다. ${topCategoryName ?? "핵심 작업"} 흐름을 유지한 채 한 세션만 더 쌓으면 하루 마무리가 아주 좋습니다.`,
      score: goalProgressPercent,
    };
  }

  const highRatedSessions = completedToday.filter(
    (session) => (session.selfRating ?? 0) >= 4,
  );
  if (
    highRatedSessions.length >= 2 &&
    highRatedSessions.length >= Math.ceil(completedToday.length / 2)
  ) {
    return {
      kind: "session-stamina",
      title: "집중 품질이 안정적입니다",
      summary: `자가평가 4점 이상 세션이 ${highRatedSessions.length}개입니다. 단순히 오래 한 것보다, 흐트러지지 않은 세션이 꾸준히 나온 날입니다.`,
      score: highRatedSessions.length,
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

function buildWeeklyInsights(params: {
  completedSessions: FocusSession[];
  categoryBreakdown: WeeklyReportPageData["categoryBreakdown"];
  timeBlocks: WeeklyReportPageData["timeBlocks"];
  dayStats: WeeklyReportPageData["dayStats"];
  goalAchievementRate: number | null;
  interruptionRate: number | null;
  longestFocusStreakDays: number;
  categorySwitchCount: number;
}): InsightMessage[] {
  const {
    completedSessions,
    categoryBreakdown,
    timeBlocks,
    dayStats,
    goalAchievementRate,
    interruptionRate,
    longestFocusStreakDays,
    categorySwitchCount,
  } = params;

  if (completedSessions.length === 0) {
    return [
      {
        kind: "routine",
        title: "이번 주 리포트를 채울 첫 세션이 필요합니다",
        summary: "완료된 세션이 아직 없어 패턴을 읽기 어렵습니다. 하루 1세션만 쌓여도 다음 주부터 시간대와 카테고리 흐름이 보이기 시작합니다.",
      },
    ];
  }

  const insights: InsightMessage[] = [];
  const topCategory = categoryBreakdown[0];
  if (topCategory && topCategory.share >= 55) {
    insights.push({
      kind: "category-bias",
      title: `${topCategory.categoryName} 편중이 강한 주간입니다`,
      summary: `이번 주 집중 시간의 ${topCategory.share}%가 ${topCategory.categoryName}에 몰려 있습니다. 우선순위가 선명했다는 뜻이지만, 다른 작업이 밀렸는지도 함께 점검할 만합니다.`,
      score: topCategory.share,
    });
  }

  const bestBlock = [...timeBlocks].sort((a, b) => b.totalMinutes - a.totalMinutes)[0];
  if (bestBlock && bestBlock.totalMinutes > 0) {
    insights.push({
      kind: "time-block",
      title: `${bestBlock.label} 시간대에 가장 강합니다`,
      summary: `${bestBlock.label}에 ${bestBlock.totalMinutes}분을 기록했습니다. 완료율 ${bestBlock.completionRate ?? 0}%${bestBlock.averageRating ? `, 평균 평점 ${bestBlock.averageRating}` : ""}로 이번 주 주력 시간대로 보입니다.`,
      score: bestBlock.totalMinutes,
    });
  }

  const bestDay = [...dayStats].sort((a, b) => b.totalMinutes - a.totalMinutes)[0];
  const quietDays = dayStats.filter((day) => day.totalMinutes === 0).length;
  if (bestDay && bestDay.totalMinutes > 0) {
    insights.push({
      kind: "routine",
      title: `${bestDay.label}요일 흐름이 가장 좋았습니다`,
      summary: `${bestDay.label}요일에 ${bestDay.totalMinutes}분을 기록했습니다.${quietDays > 0 ? ` 반대로 기록이 없는 날이 ${quietDays}일 있어 루틴의 간격은 조금 큰 편입니다.` : " 주간 루틴이 비교적 고르게 유지됐습니다."}`,
      score: bestDay.totalMinutes,
    });
  }

  if (longestFocusStreakDays >= 3) {
    insights.push({
      kind: "routine",
      title: `${longestFocusStreakDays}일 연속 집중 흐름이 잡혔습니다`,
      summary: `기록이 하루 반짝으로 끝나지 않고 이어졌습니다. 지금 루틴은 유지 가치가 높은 편이라, 같은 시간대에 반복 배치하는 전략이 잘 맞습니다.`,
      score: longestFocusStreakDays,
    });
  }

  if (interruptionRate !== null && interruptionRate >= 30) {
    insights.push({
      kind: "trend",
      title: "중단 비율이 다소 높은 주간입니다",
      summary: `이번 주 세션 중 ${interruptionRate}%가 중단되었습니다. 세션 길이를 조금 짧게 가져가거나 방해 요소가 적은 시간대로 옮기면 완주율을 끌어올릴 수 있습니다.`,
      score: interruptionRate,
    });
  }

  if (categorySwitchCount >= 4) {
    insights.push({
      kind: "category-bias",
      title: "작업 전환 빈도가 높은 편입니다",
      summary: `이번 주 카테고리 전환이 ${categorySwitchCount}번 있었습니다. 맥락 전환 비용이 컸을 수 있으니, 비슷한 카테고리를 묶어 처리하는 편이 더 효율적일 수 있습니다.`,
      score: categorySwitchCount,
    });
  }

  if (goalAchievementRate !== null) {
    insights.push(
      goalAchievementRate >= 100
        ? {
            kind: "trend",
            title: "주간 목표를 달성했습니다",
            summary: `이번 주 목표 대비 ${goalAchievementRate}%를 기록했습니다. 지금 템포라면 목표를 조금 상향해도 무리가 없을 수 있습니다.`,
            score: goalAchievementRate,
          }
        : {
            kind: "trend",
            title: "주간 목표까지 조금 남았습니다",
            summary: `이번 주 목표 달성률은 ${goalAchievementRate}%입니다. 가장 강한 시간대에 짧은 세션 1~2개를 더 배치하면 목표에 더 가까워질 수 있습니다.`,
            score: goalAchievementRate,
          },
    );
  }

  return insights.slice(0, 4);
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
  const [categories, activeSessionResult, resumableSessionResult] = await Promise.all([
    getCategoriesForUser(userId),
    supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "interrupted")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (activeSessionResult.error) {
    throw new Error(activeSessionResult.error.message);
  }

  if (resumableSessionResult.error) {
    throw new Error(resumableSessionResult.error.message);
  }

  return {
    categories,
    activeSession: activeSessionResult.data
      ? mapSession(activeSessionResult.data)
      : null,
    resumableSession: resumableSessionResult.data
      ? mapSession(resumableSessionResult.data)
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
  const goalDate = getGoalDate();

  const [todayResult, yesterdayResult, recentResult, categories, goalResult] = await Promise.all([
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
    supabase
      .from("daily_goals")
      .select("*")
      .eq("user_id", userId)
      .eq("goal_date", goalDate)
      .maybeSingle(),
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

  if (goalResult.error) {
    throw new Error(goalResult.error.message);
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
  const dailyGoal = goalResult.data ? mapDailyGoal(goalResult.data) : null;

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
    goalFocusMinutes: dailyGoal?.targetFocusMinutes ?? null,
    goalSessions: dailyGoal?.targetSessions ?? null,
    focusGoalProgressPercent: dailyGoal
      ? Math.min(
          100,
          Math.round((totalFocusMinutes / dailyGoal.targetFocusMinutes) * 100),
        )
      : null,
    sessionGoalProgressPercent: dailyGoal
      ? Math.min(
          100,
          Math.round((completedSessions / dailyGoal.targetSessions) * 100),
        )
      : null,
    insightSummary: null,
  };

  const insight = buildDailyInsight(
    completedToday,
    topCategoryName,
    summary.focusGoalProgressPercent,
  );
  summary.insightSummary = insight?.summary ?? null;

  return {
    summary,
    recentSessions,
    categories,
    insight,
  };
}

export async function getSettingsPageData(
  userId: string,
): Promise<SettingsPageData> {
  const supabase = await createClient();
  const goalDate = getGoalDate();
  const { data, error } = await supabase
    .from("daily_goals")
    .select("*")
    .eq("user_id", userId)
    .eq("goal_date", goalDate)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    dailyGoal: data ? mapDailyGoal(data) : null,
    goalDate,
  };
}

export async function getWeeklyReportPageData(
  userId: string,
): Promise<WeeklyReportPageData> {
  const supabase = await createClient();
  const weekRange = getWeekRange();

  const [{ data: sessions, error: sessionsError }, { data: goals, error: goalsError }, categories] =
    await Promise.all([
      supabase
        .from("sessions")
        .select("*")
        .eq("user_id", userId)
        .gte("started_at", weekRange.startIso)
        .lte("started_at", weekRange.endIso)
        .order("started_at", { ascending: false }),
      supabase
        .from("daily_goals")
        .select("*")
        .eq("user_id", userId)
        .gte("goal_date", getGoalDate(weekRange.start))
        .lte("goal_date", getGoalDate(weekRange.end)),
      getCategoriesForUser(userId),
    ]);

  if (sessionsError) {
    throw new Error(sessionsError.message);
  }

  if (goalsError) {
    throw new Error(goalsError.message);
  }

  const mappedSessions = (sessions ?? []).map(mapSession);
  const completedSessions = mappedSessions.filter(
    (session) => session.status === "completed",
  );
  const totalFocusMinutes = completedSessions.reduce(
    (sum, session) => sum + (session.actualMinutes ?? 0),
    0,
  );
  const totalSessions = completedSessions.length;
  const averageSessionMinutes =
    totalSessions > 0 ? Math.round(totalFocusMinutes / totalSessions) : 0;

  const totalGoalMinutes = (goals ?? []).reduce(
    (sum, goal) => sum + goal.target_focus_minutes,
    0,
  );

  const categoryMinutes = new Map<string | null, number>();
  for (const session of completedSessions) {
    const key = session.categoryId;
    categoryMinutes.set(
      key,
      (categoryMinutes.get(key) ?? 0) + (session.actualMinutes ?? 0),
    );
  }

  const categoryBreakdown = [...categoryMinutes.entries()]
    .map(([categoryId, minutes]) => ({
      categoryId,
      categoryName:
        categories.find((category) => category.id === categoryId)?.name ??
        "카테고리 없음",
      categoryColor:
        categories.find((category) => category.id === categoryId)?.color ?? null,
      totalMinutes: minutes,
      share:
        totalFocusMinutes > 0
          ? Math.round((minutes / totalFocusMinutes) * 100)
          : 0,
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];
  const dayStats = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekRange.start);
    date.setDate(weekRange.start.getDate() + index);
    const dateKey = getGoalDate(date);
    const sessionsOfDay = completedSessions.filter((session) => {
      const started = new Date(session.startedAt);
      return getGoalDate(started) === dateKey;
    });

    return {
      label: weekdayLabels[date.getDay()],
      date: dateKey,
      totalMinutes: sessionsOfDay.reduce(
        (sum, session) => sum + (session.actualMinutes ?? 0),
        0,
      ),
      sessions: sessionsOfDay.length,
    };
  });
  const longestFocusStreakDays = getLongestFocusStreak(dayStats);
  const categorySwitchCount = getCategorySwitchCount(completedSessions);
  const finishedSessions = mappedSessions.filter(
    (session) => session.status !== "active",
  );
  const interruptedSessions = mappedSessions.filter(
    (session) => session.status === "interrupted",
  );
  const interruptionRate =
    finishedSessions.length > 0
      ? Math.round((interruptedSessions.length / finishedSessions.length) * 100)
      : null;

  const timeBlockDefinitions = [
    { label: "오전", matcher: (hour: number) => hour < 12 },
    { label: "오후", matcher: (hour: number) => hour >= 12 && hour < 18 },
    { label: "저녁", matcher: (hour: number) => hour >= 18 },
  ];

  const timeBlocks = timeBlockDefinitions.map(({ label, matcher }) => {
    const blockSessions = mappedSessions.filter((session) =>
      matcher(new Date(session.startedAt).getHours()),
    );
    const completedInBlock = blockSessions.filter(
      (session) => session.status === "completed",
    );
    const totalMinutes = completedInBlock.reduce(
      (sum, session) => sum + (session.actualMinutes ?? 0),
      0,
    );
    const ratingSessions = completedInBlock.filter(
      (session) => typeof session.selfRating === "number",
    );

    return {
      label,
      totalMinutes,
      sessions: completedInBlock.length,
      averageRating:
        ratingSessions.length > 0
          ? Number(
              (
                ratingSessions.reduce(
                  (sum, session) => sum + (session.selfRating ?? 0),
                  0,
                ) / ratingSessions.length
              ).toFixed(1),
            )
          : null,
      completionRate:
        blockSessions.length > 0
          ? Math.round((completedInBlock.length / blockSessions.length) * 100)
          : null,
    };
  });

  const summary = {
    totalFocusMinutes,
    totalSessions,
    averageSessionMinutes,
    goalAchievementRate:
      totalGoalMinutes > 0
        ? Math.round((totalFocusMinutes / totalGoalMinutes) * 100)
        : null,
    topCategoryName: categoryBreakdown[0]?.categoryName ?? null,
    bestTimeBlock:
      [...timeBlocks].sort((a, b) => b.totalMinutes - a.totalMinutes)[0]?.label ??
      null,
    interruptionRate,
    longestFocusStreakDays,
    categorySwitchCount,
  };

  const insights = buildWeeklyInsights({
    completedSessions,
    categoryBreakdown,
    timeBlocks,
    dayStats,
    goalAchievementRate: summary.goalAchievementRate,
    interruptionRate: summary.interruptionRate,
    longestFocusStreakDays: summary.longestFocusStreakDays,
    categorySwitchCount: summary.categorySwitchCount,
  });

  return {
    summary,
    categoryBreakdown,
    timeBlocks,
    dayStats,
    recentCompletedSessions: completedSessions.slice(0, 5),
    weekRangeLabel: getDateRangeLabel(weekRange.start, weekRange.end),
    insights,
  };
}
