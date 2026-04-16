import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { getDashboardPageData } from "@/lib/sessions/queries";
import { Clock3, FolderKanban, History, Sparkles, Timer } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const statusLabel: Record<string, string> = {
  active: "진행 중",
  completed: "완료",
  cancelled: "취소",
  interrupted: "중단",
};

function formatChangeSummary(
  percent: number | null,
  totalFocusMinutes: number,
) {
  if (percent === null) {
    return "어제와 비교할 데이터가 없습니다.";
  }

  if (totalFocusMinutes === 0) {
    return "어제보다 기록이 줄었습니다.";
  }

  if (Math.abs(percent) >= 300) {
    return percent > 0
      ? "어제보다 집중 시간이 크게 늘었습니다."
      : "어제보다 집중 시간이 크게 줄었습니다.";
  }

  if (percent === 0) {
    return "어제와 비슷한 수준입니다.";
  }

  return `어제 대비 ${percent > 0 ? "+" : ""}${percent}%`;
}

function DashboardFallback() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-0">
      <div className="devflow-panel p-8">
        <p className="devflow-kicker">
          Dashboard
        </p>
        <div className="devflow-skeleton mt-3 h-10 w-72" />
        <div className="devflow-skeleton mt-3 h-6 w-full max-w-2xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="devflow-skeleton h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="devflow-skeleton h-9 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

async function DashboardContent() {
  const authState = await getAuthUser();

  if (!authState) {
    redirect("/auth/login");
  }

  const data = await getDashboardPageData(authState.user.id);
  const remainingFocusMinutes =
    data.summary.goalFocusMinutes === null
      ? null
      : Math.max(
          0,
          data.summary.goalFocusMinutes - data.summary.totalFocusMinutes,
        );
  const focusGoalStatus =
    remainingFocusMinutes === null
      ? null
      : remainingFocusMinutes === 0
        ? "오늘 집중 목표를 달성했습니다."
        : `오늘 목표까지 ${remainingFocusMinutes}분 남았습니다.`;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-0">
      <div className="devflow-panel p-8">
        <p className="devflow-kicker">
          Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
          오늘의 집중 흐름을 한눈에 확인합니다.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          세션이 쌓일수록 카테고리 편중, 시간대 패턴, 집중 유지력을 이 화면에서 바로
          읽을 수 있게 됩니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock3 className="h-4 w-4 text-primary" />
              오늘 총 집중 시간
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {data.summary.totalFocusMinutes}분
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatChangeSummary(
                data.summary.changeFromYesterdayPercent,
                data.summary.totalFocusMinutes,
              )}
            </p>
            {data.summary.goalFocusMinutes ? (
              <p className="mt-1 text-sm text-muted-foreground">
                목표 {data.summary.goalFocusMinutes}분 / 진행률{" "}
                {data.summary.focusGoalProgressPercent ?? 0}%
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                오늘 목표가 아직 설정되지 않았습니다.
              </p>
            )}
            {focusGoalStatus ? (
              <p className="mt-1 text-sm font-medium text-foreground">
                {focusGoalStatus}
              </p>
            ) : null}
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
              {data.summary.completedSessions}개
            </p>
            {data.summary.goalSessions ? (
              <p className="mt-2 text-sm text-muted-foreground">
                목표 {data.summary.goalSessions}개 / 진행률{" "}
                {data.summary.sessionGoalProgressPercent ?? 0}%
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                세션 수 목표가 아직 설정되지 않았습니다.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderKanban className="h-4 w-4 text-amber-600" />
              가장 많이 한 카테고리
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">
              {data.summary.topCategoryName ?? "아직 없음"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-purple-500" />
              최고 집중 시간대
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">
              {data.summary.bestTimeBlock ?? "데이터 없음"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-purple-500" />
              오늘의 한 줄 인사이트
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-6">
              <p className="text-lg font-semibold text-foreground">
                {data.insight?.title ?? "인사이트를 준비 중입니다"}
              </p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {data.insight?.summary ??
                  "세션 데이터가 더 쌓이면 오늘의 흐름을 자동으로 해석해 드립니다."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/timer"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-[#2563EB] active:scale-[0.98]"
              >
                새 세션 시작
              </Link>
              <Link
                href="/history"
                className="rounded-md border border-[#2F3A49] px-4 py-2 text-sm font-medium text-foreground transition hover:bg-[#1B222C] active:scale-[0.98]"
              >
                히스토리 보기
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-green-500" />
              최근 세션
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                아직 기록된 세션이 없습니다. 타이머에서 첫 세션을 시작해 보세요.
              </p>
            ) : (
              data.recentSessions.map((session) => (
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
                    상태: {statusLabel[session.status] ?? session.status} / 기록 시간:{" "}
                    {session.actualMinutes ?? 0}분
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  );
}
