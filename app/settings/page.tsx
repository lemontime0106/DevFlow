import { upsertDailyGoalAction } from "@/app/settings/actions";
import { ToastFeedback } from "@/components/ui/toast-feedback";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { getSettingsPageData } from "@/lib/sessions/queries";
import { Target, Timer, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

function SettingsFallback() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-0">
      <div className="rounded-[2rem] border border-border/70 bg-background/90 p-8 shadow-sm">
        <div className="h-4 w-20 rounded bg-muted/40" />
        <div className="mt-3 h-10 w-72 rounded-xl bg-muted/50" />
      </div>
    </section>
  );
}

async function SettingsContent({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
  }>;
}) {
  const authState = await getAuthUser();

  if (!authState) {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const data = await getSettingsPageData(authState.user.id);
  const toastMessage =
    params.saved === "goal" ? "오늘 목표가 저장되었습니다." : null;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-0">
      <ToastFeedback message={toastMessage} />
      <div className="rounded-[2rem] border border-border/70 bg-background/90 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">
          Settings
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          오늘 기준 목표를 설정하고 대시보드와 연결합니다.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          현재는 `daily_goals`를 중심으로 일일 집중 시간, 세션 수, 주간 목표 일수를
          관리합니다. 저장한 값은 대시보드 집계와 바로 연결됩니다.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-[1.75rem] border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="h-5 w-5 text-emerald-600" />
              오늘의 목표 설정
            </CardTitle>
            <CardDescription>
              날짜별로 목표를 저장하면 같은 날짜 기준으로 대시보드 진행률이 계산됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={upsertDailyGoalAction} className="space-y-5">
              <input type="hidden" name="goalDate" value={data.goalDate} />
              <div className="space-y-2">
                <Label htmlFor="goal-date">기준 날짜</Label>
                <Input id="goal-date" value={data.goalDate} disabled />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="target-focus-minutes">일일 집중 목표 시간(분)</Label>
                  <Input
                    id="target-focus-minutes"
                    name="targetFocusMinutes"
                    type="number"
                    min={1}
                    defaultValue={data.dailyGoal?.targetFocusMinutes ?? 120}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-sessions">일일 목표 세션 수</Label>
                  <Input
                    id="target-sessions"
                    name="targetSessions"
                    type="number"
                    min={1}
                    defaultValue={data.dailyGoal?.targetSessions ?? 4}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-days-per-week">주간 목표 일수</Label>
                <Input
                  id="target-days-per-week"
                  name="targetDaysPerWeek"
                  type="number"
                  min={1}
                  max={7}
                  defaultValue={data.dailyGoal?.targetDaysPerWeek ?? 5}
                />
              </div>
              <Button className="w-full">목표 저장</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[1.75rem] border-border/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Timer className="h-5 w-5 text-sky-600" />
                현재 연결 상태
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                오늘 목표 시간: {data.dailyGoal?.targetFocusMinutes ?? 120}분
              </p>
              <p>
                오늘 목표 세션 수: {data.dailyGoal?.targetSessions ?? 4}개
              </p>
              <p>
                주간 목표 일수: {data.dailyGoal?.targetDaysPerWeek ?? 5}일
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-border/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                다음 확장 후보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>기본 집중/휴식 시간 프리셋 연결</p>
              <p>알림 on/off 및 세션 종료 알림 설정</p>
              <p>카테고리별 목표 분리와 목표 초과 기록 분석</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default function SettingsPage(props: {
  searchParams: Promise<{
    saved?: string;
  }>;
}) {
  return (
    <Suspense fallback={<SettingsFallback />}>
      <SettingsContent {...props} />
    </Suspense>
  );
}
