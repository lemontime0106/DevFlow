"use client";

import {
  cancelSessionAction,
  completeSessionAction,
  interruptSessionAction,
  resumeInterruptedSessionAction,
  startSessionAction,
} from "@/app/timer/actions";
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
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TimerPageData } from "@/lib/sessions/types";
import { Clock3, PauseCircle, PlayCircle, RotateCcw, Square, StopCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface TimerWorkspaceProps {
  data: TimerPageData;
}

function formatDuration(totalSeconds: number) {
  const safeValue = Math.max(0, totalSeconds);
  const hours = Math.floor(safeValue / 3600);
  const minutes = Math.floor((safeValue % 3600) / 60);
  const seconds = safeValue % 60;

  if (hours > 0) {
    return [hours, minutes, seconds]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  }

  return [minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function TimerWorkspace({ data }: TimerWorkspaceProps) {
  const [now, setNow] = useState(Date.now());
  const [focusMinutes, setFocusMinutes] = useState(
    data.settings?.defaultFocusMinutes ?? 25,
  );
  const [breakMinutes, setBreakMinutes] = useState(
    data.settings?.defaultBreakMinutes ?? 5,
  );

  useEffect(() => {
    if (!data.activeSession) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [data.activeSession]);

  const activeMetrics = useMemo(() => {
    if (!data.activeSession) return null;

    const startedAt = new Date(data.activeSession.startedAt).getTime();
    const accumulatedSeconds = (data.activeSession.actualMinutes ?? 0) * 60;
    const elapsedSeconds =
      accumulatedSeconds + Math.max(0, Math.floor((now - startedAt) / 1000));
    const remainingSeconds =
      data.activeSession.focusMinutes * 60 - elapsedSeconds;

    return {
      elapsedSeconds,
      remainingSeconds,
      progressPercent: Math.min(
        100,
        Math.round(
          (elapsedSeconds / (data.activeSession.focusMinutes * 60)) * 100,
        ),
      ),
    };
  }, [data.activeSession, now]);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-0">
      <div className="devflow-panel p-8">
        <p className="devflow-kicker">
          Timer
        </p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
          세션을 시작하고 끝난 직후 바로 기록하세요.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          DevFlow의 핵심 입력 흐름입니다. 세션이 끝나는 순간 기록까지 이어져야
          이후 히스토리와 대시보드 집계가 살아납니다.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <PlayCircle className="h-5 w-5 text-primary" />
              새 집중 세션 시작
            </CardTitle>
            <CardDescription>
              프리셋이나 커스텀 시간으로 세션을 만들면 `sessions` 테이블에 즉시 저장됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={startSessionAction} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="focus-minutes">집중 시간</Label>
                  <Input
                    id="focus-minutes"
                    name="focusMinutes"
                    type="number"
                    min={1}
                    value={focusMinutes}
                    onChange={(event) => setFocusMinutes(Number(event.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="break-minutes">휴식 시간</Label>
                  <Input
                    id="break-minutes"
                    name="breakMinutes"
                    type="number"
                    min={0}
                    value={breakMinutes}
                    onChange={(event) => setBreakMinutes(Number(event.target.value))}
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "My Default",
                    focus: data.settings?.defaultFocusMinutes ?? 25,
                    breakMinutes: data.settings?.defaultBreakMinutes ?? 5,
                  },
                  { label: "Pomodoro", focus: 25, breakMinutes: 5 },
                  { label: "Deep Work", focus: 50, breakMinutes: 10 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    className="rounded-lg border border-border bg-secondary px-4 py-4 text-left transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[#2F3A49] hover:bg-[#1B222C] active:scale-[0.98]"
                    onClick={() => {
                      setFocusMinutes(preset.focus);
                      setBreakMinutes(preset.breakMinutes);
                    }}
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {preset.label}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {preset.focus}분 집중 / {preset.breakMinutes}분 휴식
                    </p>
                  </button>
                ))}
              </div>
              <Button className="w-full" disabled={Boolean(data.activeSession)}>
                {data.activeSession ? "진행 중인 세션이 있습니다" : "세션 시작"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock3 className="h-5 w-5 text-primary" />
              진행 상태
            </CardTitle>
            <CardDescription>
              중단 시 현재까지의 누적 시간을 저장하고, 이후 이어서 재개할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.activeSession && activeMetrics ? (
              <div className="space-y-6">
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-6">
                  <p className="text-sm uppercase text-muted-foreground">
                    Active Session
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">경과 시간</p>
                      <p className="mt-1 font-mono text-5xl font-semibold">
                        {formatDuration(activeMetrics.elapsedSeconds)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">남은 시간</p>
                      <p className="mt-1 font-mono text-5xl font-semibold">
                        {formatDuration(activeMetrics.remainingSeconds)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    시작 시각: {new Date(data.activeSession.startedAt).toLocaleString("ko-KR")}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    누적 진행률: {activeMetrics.progressPercent}%
                  </p>
                  <div className="mt-4 h-2 rounded-full bg-border">
                    <div
                      className="h-2 rounded-full bg-primary transition-[width]"
                      style={{ width: `${activeMetrics.progressPercent}%` }}
                    />
                  </div>
                  {activeMetrics.remainingSeconds <= 0 ? (
                    <p className="mt-4 text-sm font-medium text-green-500">
                      목표 시간이 지났습니다. 지금 기록을 남기고 세션을 마무리할 수 있습니다.
                    </p>
                  ) : null}
                </div>

                <form action={completeSessionAction} className="space-y-5">
                  <input type="hidden" name="sessionId" value={data.activeSession.id} />
                  <div className="space-y-2">
                    <Label htmlFor="title">작업명</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="예: 인증 리다이렉트 처리 정리"
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="categoryId">카테고리</Label>
                      <Select id="categoryId" name="categoryId" defaultValue="">
                        <option value="">카테고리 선택</option>
                        {data.categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">난이도</Label>
                      <Select id="difficulty" name="difficulty" defaultValue="">
                        <option value="">난이도 선택</option>
                        <option value="easy">쉬움</option>
                        <option value="normal">보통</option>
                        <option value="hard">어려움</option>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="selfRating">집중도 자가평가</Label>
                    <Select id="selfRating" name="selfRating" defaultValue="">
                      <option value="">평가 선택</option>
                      <option value="5">5점 아주 좋음</option>
                      <option value="4">4점 좋음</option>
                      <option value="3">3점 보통</option>
                      <option value="2">2점 아쉬움</option>
                      <option value="1">1점 많이 흐트러짐</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memo">메모</Label>
                    <Textarea
                      id="memo"
                      name="memo"
                      placeholder="세션 중 방해 요소나 회고 메모를 남겨보세요."
                    />
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button className="flex-1">
                      <Square className="h-4 w-4" />
                      세션 종료 후 저장
                    </Button>
                    <Button
                      type="submit"
                      formAction={interruptSessionAction}
                      variant="secondary"
                      className="flex-1"
                      formNoValidate
                    >
                      <PauseCircle className="h-4 w-4" />
                      일시정지
                    </Button>
                    <Button
                      type="submit"
                      formAction={cancelSessionAction}
                      variant="outline"
                      className="flex-1"
                      formNoValidate
                    >
                      <StopCircle className="h-4 w-4" />
                      세션 취소
                    </Button>
                  </div>
                </form>
              </div>
            ) : data.resumableSession ? (
              <div className="space-y-6">
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-6">
                  <p className="text-sm uppercase text-amber-500">
                    Interrupted Session
                  </p>
                  <p className="mt-3 text-xl font-semibold">
                    {data.resumableSession.title || "이어서 진행할 세션"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {data.resumableSession.actualMinutes ?? 0}분까지 진행한 세션이 있습니다.
                    같은 설정으로 다시 시작해 남은 시간을 이어갈 수 있습니다.
                  </p>
                  <div className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                    <p>집중 시간: {data.resumableSession.focusMinutes}분</p>
                    <p>휴식 시간: {data.resumableSession.breakMinutes}분</p>
                    <p>누적 시간: {data.resumableSession.actualMinutes ?? 0}분</p>
                  </div>
                </div>

                <form action={resumeInterruptedSessionAction}>
                  <input
                    type="hidden"
                    name="sessionId"
                    value={data.resumableSession.id}
                  />
                  <Button className="w-full">
                    <RotateCcw className="h-4 w-4" />
                    중단된 세션 이어서 시작
                  </Button>
                </form>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-secondary/70 p-8 text-center">
                <p className="text-lg font-medium text-foreground">
                  진행 중인 세션이 없습니다.
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  왼쪽에서 세션을 시작하면 이 영역에서 경과 시간과 기록 입력 폼이
                  함께 열립니다. 중단된 세션이 있으면 여기서 바로 복원할 수 있습니다.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
