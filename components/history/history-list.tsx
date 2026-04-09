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

export function HistoryList({ data, filters }: HistoryListProps) {
  const categoryMap = new Map(data.categories.map((category) => [category.id, category]));

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-0">
      <div className="rounded-[2rem] border border-border/70 bg-background/90 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">
          History
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          저장된 세션을 날짜와 상태별로 다시 확인합니다.
        </h1>
      </div>

      <Card className="rounded-[1.75rem] border-border/70">
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
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                type="date"
                name="date"
                defaultValue={filters.date ?? ""}
              />
            </div>
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground md:col-span-3">
              필터 적용
            </button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {data.sessions.length === 0 ? (
          <Card className="rounded-[1.75rem] border-border/70">
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
              <Card key={session.id} className="rounded-[1.75rem] border-border/70">
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        {session.title || "제목 없는 세션"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {new Date(session.startedAt).toLocaleString("ko-KR")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-border/70 px-3 py-1">
                        {statusLabel[session.status] ?? session.status}
                      </span>
                      <span className="rounded-full border border-border/70 px-3 py-1">
                        {session.actualMinutes ?? 0}분
                      </span>
                      <span className="rounded-full border border-border/70 px-3 py-1">
                        {category?.name ?? "카테고리 없음"}
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                    <p>난이도: {session.difficulty ?? "-"}</p>
                    <p>집중도: {session.selfRating ?? "-"}</p>
                    <p>휴식: {session.breakMinutes}분</p>
                  </div>
                  {session.memo ? (
                    <div className="rounded-2xl bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
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
