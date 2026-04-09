import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { getDashboardPageData } from "@/lib/sessions/queries";
import { Clock3, FolderKanban, History, Sparkles, Timer } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

function DashboardFallback() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-0">
      <div className="rounded-[2rem] border border-border/70 bg-background/90 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">
          Dashboard
        </p>
        <div className="mt-3 h-10 w-72 rounded-xl bg-muted/50" />
        <div className="mt-3 h-6 w-full max-w-2xl rounded-xl bg-muted/40" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="rounded-[1.75rem] border-border/70">
            <CardHeader>
              <div className="h-4 w-32 rounded bg-muted/40" />
            </CardHeader>
            <CardContent>
              <div className="h-9 w-24 rounded bg-muted/50" />
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

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-0">
      <div className="rounded-[2rem] border border-border/70 bg-background/90 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">
          Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          오늘의 집중 흐름을 한눈에 확인합니다.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          세션이 쌓일수록 카테고리 편중, 시간대 패턴, 집중 유지력을 이 화면에서 바로
          읽을 수 있게 됩니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-[1.75rem] border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock3 className="h-4 w-4 text-sky-600" />
              오늘 총 집중 시간
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {data.summary.totalFocusMinutes}분
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              어제 대비 {data.summary.changeFromYesterdayPercent ?? 0}%
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Timer className="h-4 w-4 text-emerald-600" />
              완료 세션 수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {data.summary.completedSessions}개
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderKanban className="h-4 w-4 text-amber-600" />
              가장 많이 한 카테고리
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold tracking-tight">
              {data.summary.topCategoryName ?? "아직 없음"}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-fuchsia-600" />
              최고 집중 시간대
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold tracking-tight">
              {data.summary.bestTimeBlock ?? "데이터 없음"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[1.75rem] border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-fuchsia-600" />
              오늘의 한 줄 인사이트
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.5rem] bg-muted/30 p-6">
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
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                새 세션 시작
              </Link>
              <Link
                href="/history"
                className="rounded-full border border-border/70 px-4 py-2 text-sm font-medium text-foreground"
              >
                히스토리 보기
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-emerald-600" />
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
                  className="rounded-2xl border border-border/70 bg-muted/20 p-4"
                >
                  <p className="font-medium text-foreground">
                    {session.title || "제목 없는 세션"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(session.startedAt).toLocaleString("ko-KR")}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    상태: {session.status} / 기록 시간: {session.actualMinutes ?? 0}분
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
