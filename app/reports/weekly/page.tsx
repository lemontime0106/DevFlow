import { CategoryBadge } from "@/components/sessions/category-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { getWeeklyReportPageData } from "@/lib/sessions/queries";
import {
  BarChart3,
  CalendarRange,
  Clock3,
  FolderKanban,
  GitCompareArrows,
  PauseCircle,
  Sparkles,
  Timer,
} from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const statusLabel: Record<string, string> = {
  active: "진행 중",
  completed: "완료",
  cancelled: "취소",
  interrupted: "중단",
};

function WeeklyReportFallback() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-0">
      <div className="devflow-panel p-8">
        <div className="devflow-skeleton h-4 w-24" />
        <div className="devflow-skeleton mt-3 h-10 w-80" />
      </div>
    </section>
  );
}

async function WeeklyReportContent() {
  const authState = await getAuthUser();

  if (!authState) {
    redirect("/auth/login");
  }

  const data = await getWeeklyReportPageData(authState.user.id);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-0">
      <div className="devflow-panel p-8">
        <p className="devflow-kicker">
          Weekly Report
        </p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
          최근 7일 집중 패턴을 한 번에 읽습니다.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          총 시간, 평균 세션 길이, 요일 흐름, 시간대별 성과를 같은 화면에서 빠르게
          확인할 수 있게 정리했습니다.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm text-muted-foreground">
          <CalendarRange className="h-4 w-4" />
          {data.weekRangeLabel}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock3 className="h-4 w-4 text-primary" />
              주간 총 집중 시간
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {data.summary.totalFocusMinutes}분
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Timer className="h-4 w-4 text-green-500" />
              완료 세션 수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {data.summary.totalSessions}개
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-amber-600" />
              평균 세션 길이
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {data.summary.averageSessionMinutes}분
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-purple-500" />
              목표 달성률
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {data.summary.goalAchievementRate ?? 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Timer className="h-4 w-4 text-green-500" />
              연속 집중일
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {data.summary.longestFocusStreakDays}일
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PauseCircle className="h-4 w-4 text-amber-600" />
              세션 중단률
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {data.summary.interruptionRate ?? 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GitCompareArrows className="h-4 w-4 text-primary" />
              카테고리 전환
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {data.summary.categorySwitchCount}회
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>요일별 흐름</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.dayStats.map((day) => {
              const width =
                data.summary.totalFocusMinutes > 0
                  ? Math.max(
                      6,
                      Math.round(
                        (day.totalMinutes / data.summary.totalFocusMinutes) * 100,
                      ),
                    )
                  : 0;

              return (
                <div key={day.date} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium text-foreground">
                      {day.label}요일
                    </p>
                    <p className="text-muted-foreground">
                      {day.totalMinutes}분 / {day.sessions}세션
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-border">
                    <div
                      className="h-2 rounded-full bg-primary transition-[width]"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>주간 요약</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-lg border border-border bg-secondary/60 p-4">
              <p className="font-medium text-foreground">가장 많이 한 카테고리</p>
              <p className="mt-2">
                {data.summary.topCategoryName ?? "아직 데이터 없음"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/60 p-4">
              <p className="font-medium text-foreground">가장 집중된 시간대</p>
              <p className="mt-2">
                {data.summary.bestTimeBlock ?? "아직 데이터 없음"}
              </p>
            </div>
            {data.insights.map((insight) => (
              <div key={`${insight.kind}-${insight.title}`} className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-4">
                <p className="font-medium text-foreground">{insight.title}</p>
                <p className="mt-2 leading-6">{insight.summary}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderKanban className="h-5 w-5 text-amber-600" />
              카테고리별 집중 비율
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.categoryBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                이번 주 완료된 세션이 아직 없습니다.
              </p>
            ) : (
              data.categoryBreakdown.map((item) => (
              <div key={`${item.categoryId ?? "none"}-${item.categoryName}`} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <CategoryBadge
                      color={item.categoryColor}
                      name={item.categoryName}
                    />
                    <p className="text-muted-foreground">
                      {item.totalMinutes}분 / {item.share}%
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-border">
                    <div
                      className="h-2 rounded-full bg-amber-500 transition-[width]"
                      style={{ width: `${Math.max(item.share, 6)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-purple-500" />
              시간대별 성과
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.timeBlocks.map((block) => (
              <div
                key={block.label}
                className="rounded-lg border border-border bg-secondary/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">{block.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {block.totalMinutes}분
                  </p>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                  <p>완료 세션: {block.sessions}개</p>
                  <p>평균 평점: {block.averageRating ?? "-"}</p>
                  <p>완료율: {block.completionRate ?? 0}%</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 완료 세션</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.recentCompletedSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              아직 완료된 세션이 없어 주간 리포트를 채울 데이터가 없습니다.
            </p>
          ) : (
            data.recentCompletedSessions.map((session) => (
              <div
                key={session.id}
                className="rounded-lg border border-border bg-transparent p-4 transition hover:bg-[#1B222C]"
              >
                <p className="font-medium text-foreground">
                  {session.title || "제목 없는 세션"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Date(session.startedAt).toLocaleString("ko-KR")}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  기록 시간 {session.actualMinutes ?? 0}분 / 상태{" "}
                  {statusLabel[session.status] ?? session.status}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default function WeeklyReportsPage() {
  return (
    <Suspense fallback={<WeeklyReportFallback />}>
      <WeeklyReportContent />
    </Suspense>
  );
}
