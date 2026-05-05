import {
  createCategoryAction,
  deactivateCategoryAction,
  updateCategoryAction,
  upsertDailyGoalAction,
  upsertUserSettingsAction,
} from "@/app/settings/actions";
import { CategoryBadge } from "@/components/sessions/category-badge";
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
import { Palette, Target, Timer, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

function SettingsFallback() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-0">
      <div className="devflow-panel p-8">
        <div className="devflow-skeleton h-4 w-20" />
        <div className="devflow-skeleton mt-3 h-10 w-72" />
      </div>
    </section>
  );
}

function getSettingsToast(params: { saved?: string; error?: string }) {
  if (params.saved === "goal") {
    return "오늘 목표가 저장되었습니다.";
  }

  if (params.saved === "category") {
    return "카테고리가 추가되었습니다.";
  }

  if (params.saved === "category-updated") {
    return "카테고리가 수정되었습니다.";
  }

  if (params.saved === "category-deactivated") {
    return "카테고리가 비활성화되었습니다.";
  }

  if (params.saved === "settings") {
    return "타이머 기본값이 저장되었습니다.";
  }

  if (params.error === "duplicate-category") {
    return "이미 같은 이름의 카테고리가 있습니다.";
  }

  if (params.error === "invalid-category") {
    return "카테고리 이름과 색상을 다시 확인해 주세요.";
  }

  if (params.error === "category-not-found") {
    return "수정할 수 있는 카테고리를 찾지 못했습니다.";
  }

  return null;
}

async function SettingsContent({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
}) {
  const authState = await getAuthUser();

  if (!authState) {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const data = await getSettingsPageData(authState.user.id);
  const toastMessage = getSettingsToast(params);
  const toastTone = params.error ? "error" : "success";
  const defaultCategories = data.categories.filter(
    (category) => category.isDefault,
  );
  const customCategories = data.categories.filter(
    (category) => !category.isDefault,
  );
  const activeCustomCategories = customCategories.filter(
    (category) => category.isActive,
  );
  const inactiveCustomCategories = customCategories.filter(
    (category) => !category.isActive,
  );

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-0">
      <ToastFeedback message={toastMessage} tone={toastTone} />
      <div className="devflow-panel p-8">
        <p className="devflow-kicker">
          Settings
        </p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
          오늘 기준 목표를 설정하고 대시보드와 연결합니다.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          현재는 `daily_goals`를 중심으로 일일 집중 시간, 세션 수, 주간 목표 일수를
          관리합니다. 저장한 값은 대시보드 집계와 바로 연결됩니다.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="h-5 w-5 text-green-500" />
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Timer className="h-5 w-5 text-primary" />
                타이머 기본값
              </CardTitle>
              <CardDescription>
                저장한 값은 새 집중 세션 시작 폼의 기본 입력값으로 사용됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={upsertUserSettingsAction} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="default-focus-minutes">
                      기본 집중 시간(분)
                    </Label>
                    <Input
                      id="default-focus-minutes"
                      name="defaultFocusMinutes"
                      type="number"
                      min={1}
                      max={180}
                      defaultValue={data.settings?.defaultFocusMinutes ?? 25}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-break-minutes">
                      기본 휴식 시간(분)
                    </Label>
                    <Input
                      id="default-break-minutes"
                      name="defaultBreakMinutes"
                      type="number"
                      min={0}
                      max={60}
                      defaultValue={data.settings?.defaultBreakMinutes ?? 5}
                    />
                  </div>
                </div>
                <Button className="w-full">타이머 기본값 저장</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5 text-purple-500" />
                카테고리 추가
              </CardTitle>
              <CardDescription>
                추가한 카테고리는 타이머, 히스토리, 주간 리포트에서 바로 사용할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createCategoryAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">카테고리 이름</Label>
                  <Input
                    id="category-name"
                    name="categoryName"
                    placeholder="예: Code Review"
                    maxLength={40}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-color">색상</Label>
                  <Input
                    id="category-color"
                    name="categoryColor"
                    type="color"
                    defaultValue="#10b981"
                    className="h-11 p-1"
                  />
                </div>
                <Button className="w-full">카테고리 추가</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">현재 카테고리</CardTitle>
              <CardDescription>
                기본 카테고리와 직접 추가한 카테고리를 함께 표시합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Custom
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeCustomCategories.length > 0 ? (
                    activeCustomCategories.map((category) => (
                      <form
                        key={category.id}
                        action={updateCategoryAction}
                        className="w-full rounded-lg border border-border bg-secondary/60 p-3"
                      >
                        <input
                          type="hidden"
                          name="categoryId"
                          value={category.id}
                        />
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                          <div className="flex-1 space-y-2">
                            <Label htmlFor={`category-name-${category.id}`}>
                              이름
                            </Label>
                            <Input
                              id={`category-name-${category.id}`}
                              name="categoryName"
                              defaultValue={category.name}
                              maxLength={40}
                              required
                            />
                          </div>
                          <div className="space-y-2 sm:w-24">
                            <Label htmlFor={`category-color-${category.id}`}>
                              색상
                            </Label>
                            <Input
                              id={`category-color-${category.id}`}
                              name="categoryColor"
                              type="color"
                              defaultValue={category.color}
                              className="h-9 p-1"
                            />
                          </div>
                          <Button type="submit" variant="secondary">
                            수정
                          </Button>
                          <Button
                            type="submit"
                            formAction={deactivateCategoryAction}
                            formNoValidate
                            variant="outline"
                          >
                            비활성화
                          </Button>
                        </div>
                      </form>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      아직 직접 추가한 카테고리가 없습니다.
                    </p>
                  )}
                </div>
              </div>
              {inactiveCustomCategories.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Inactive
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {inactiveCustomCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 opacity-70"
                      >
                        <CategoryBadge
                          name={category.name}
                          color={category.color}
                        />
                        <span className="text-xs text-muted-foreground">
                          새 세션 제외
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Default
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {defaultCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center gap-2 rounded-lg border border-border bg-secondary/60 px-3 py-2"
                    >
                      <CategoryBadge
                        name={category.name}
                        color={category.color}
                      />
                      <span className="text-xs text-muted-foreground">
                        기본
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                현재 연결 상태
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                오늘 목표 시간: {data.dailyGoal?.targetFocusMinutes ?? 120}분
              </p>
              <p>
                오늘 목표 세션 수: {data.dailyGoal?.targetSessions ?? 4}개
              </p>
              <p>
                기본 타이머: {data.settings?.defaultFocusMinutes ?? 25}분 집중 /{" "}
                {data.settings?.defaultBreakMinutes ?? 5}분 휴식
              </p>
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
    error?: string;
  }>;
}) {
  return (
    <Suspense fallback={<SettingsFallback />}>
      <SettingsContent {...props} />
    </Suspense>
  );
}
