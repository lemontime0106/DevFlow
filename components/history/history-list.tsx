import { CategoryBadge } from "@/components/sessions/category-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import type { HistoryFilters, HistoryPageData } from "@/lib/sessions/types";

interface HistoryListProps {
  data: HistoryPageData;
  filters: HistoryFilters;
}

const statusLabel: Record<string, string> = {
  active: "진행 중",
  completed: "완료",
  cancelled: "취소",
  interrupted: "중단",
};

const difficultyLabel: Record<string, string> = {
  easy: "쉬움",
  normal: "보통",
  hard: "어려움",
};

function formatDateTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR");
}

function getStatusTone(status: string) {
  switch (status) {
    case "completed":
      return "border-green-500/30 bg-green-500/10 text-green-500";
    case "interrupted":
      return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400";
    case "cancelled":
      return "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400";
    default:
      return "border-primary/30 bg-primary/10 text-primary";
  }
}

function getStatusDescription(status: string) {
  switch (status) {
    case "completed":
      return "세션이 정상적으로 종료되어 기록까지 저장된 상태입니다.";
    case "interrupted":
      return "중간에 멈춘 세션입니다. 타이머 화면에서 이어서 진행할 수 있습니다.";
    case "cancelled":
      return "사용자가 취소한 세션입니다. 통계에는 반영되지 않습니다.";
    default:
      return "현재 진행 중인 세션입니다.";
  }
}

export function HistoryList({ data, filters }: HistoryListProps) {
  const categoryMap = new Map(data.categories.map((category) => [category.id, category]));
  const interruptedCount = data.sessions.filter(
    (session) => session.status === "interrupted",
  ).length;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-0">
      <div className="devflow-panel p-8">
        <p className="devflow-kicker">
          History
        </p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
          저장된 세션을 날짜와 상태별로 다시 확인합니다.
        </h1>
      </div>

      <Card className="sticky top-28 z-10">
        <CardHeader>
          <CardTitle>필터</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">상태</label>
              <Select name="status" defaultValue={filters.status ?? "all"}>
                <option value="all">전체</option>
                <option value="active">진행 중</option>
                <option value="completed">완료</option>
                <option value="cancelled">취소</option>
                <option value="interrupted">중단</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">카테고리</label>
              <Select name="categoryId" defaultValue={filters.categoryId ?? "all"}>
                <option value="all">전체</option>
                {data.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">날짜</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-secondary px-3 py-1 text-sm text-foreground shadow-sm"
                type="date"
                name="date"
                defaultValue={filters.date ?? ""}
              />
            </div>
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-[#2563EB] active:scale-[0.98] md:col-span-3">
              필터 적용
            </button>
          </form>
        </CardContent>
      </Card>

      {interruptedCount > 0 ? (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
            현재 필터 기준으로 중단된 세션이 {interruptedCount}개 있습니다. 최근부터
            다시 이어갈 세션을 찾으려면 상태 필터를 `중단`으로 두고 확인하면 됩니다.
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-4">
        {data.sessions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-sm text-muted-foreground">
              조건에 맞는 세션이 없습니다. 타이머에서 첫 세션을 완료해 보세요.
            </CardContent>
          </Card>
        ) : (
          data.sessions.map((session) => {
            const category = session.categoryId
              ? categoryMap.get(session.categoryId)
              : null;

            return (
              <Card key={session.id}>
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        {session.title || "제목 없는 세션"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        시작: {formatDateTime(session.startedAt)}
                      </p>
                      {session.endedAt ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          종료: {formatDateTime(session.endedAt)}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${getStatusTone(session.status)}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {statusLabel[session.status] ?? session.status}
                      </span>
                      <span className="rounded-full border border-border px-3 py-1">
                        {session.actualMinutes ?? 0}분
                      </span>
                      <CategoryBadge
                        color={category?.color ?? null}
                        name={category?.name ?? "카테고리 없음"}
                      />
                      <span className="rounded-full border border-border px-3 py-1">
                        목표 {session.plannedMinutes}분
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/60 p-4 text-sm leading-6 text-muted-foreground">
                    {getStatusDescription(session.status)}
                  </div>
                  <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                    <p>
                      난이도:{" "}
                      {session.difficulty
                        ? difficultyLabel[session.difficulty] ?? session.difficulty
                        : "-"}
                    </p>
                    <p>
                      집중도:{" "}
                      {session.selfRating ? `${session.selfRating}점` : "-"}
                    </p>
                    <p>휴식: {session.breakMinutes}분</p>
                  </div>
                  <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                    <p>실제 기록 시간: {session.actualMinutes ?? 0}분</p>
                    <p>
                      계획 대비:{" "}
                      {(session.actualMinutes ?? 0) - session.plannedMinutes >= 0 ? "+" : ""}
                      {(session.actualMinutes ?? 0) - session.plannedMinutes}분
                    </p>
                    <p>ID 기준 상태: {statusLabel[session.status] ?? session.status}</p>
                  </div>
                  {session.memo ? (
                    <div className="rounded-lg border border-border bg-secondary/60 p-4 text-sm leading-6 text-muted-foreground">
                      {session.memo}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </section>
  );
}
