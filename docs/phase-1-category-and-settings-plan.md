# DevFlow 1회차 작업 정리: 카테고리 정책과 Settings preset 설계

작성일: 2026-05-02

## 목적

이번 회차는 실제 UI 구현 전에 데이터 정책을 먼저 고정하는 작업이다.
카테고리 삭제/비활성화 기준과 기본 집중/휴식 시간 저장 위치를 확정해 다음 구현 회차에서 SQL, 타입, 화면 작업을 바로 진행할 수 있게 한다.

## 확인한 현재 상태

- `categories` 테이블은 `is_default`만 가지고 있고 `is_active`는 없다.
- `sessions.category_id`는 `categories.id`를 참조하며, 카테고리 삭제 시 `on delete set null`로 동작한다.
- RLS에는 사용자 카테고리 삭제 정책이 열려 있지만, 현재 UI와 서버 액션에는 삭제 기능이 없다.
- Settings에서는 사용자 카테고리 생성, 이름 수정, 색상 수정까지만 지원한다.
- 기본 집중/휴식 시간은 아직 사용자 설정으로 저장되지 않고, `/timer` 클라이언트 화면의 preset 값으로만 제공된다.
- `daily_goals`는 날짜별 목표 테이블이라 기본 타이머 preset 저장소로 쓰기에는 역할이 다르다.

## 결정 1. 카테고리는 실제 삭제보다 비활성화를 우선한다

사용자가 만든 카테고리는 기본적으로 실제 delete 대신 `is_active` 기반 비활성화를 사용한다.

이유:

- 기존 세션의 카테고리 참조와 히스토리/리포트 표시가 깨지지 않는다.
- 사용자가 과거 기록을 볼 때 당시의 작업 분류 맥락이 유지된다.
- 이후 복구 기능을 추가할 수 있다.
- 실제 삭제와 집계 제외 기준이 섞이는 위험을 줄인다.

정책:

- 기본 카테고리(`is_default = true`)는 비활성화할 수 없다.
- 사용자 카테고리(`is_default = false`, `user_id = auth.uid()`)만 비활성화할 수 있다.
- 비활성 카테고리는 새 세션 선택 목록에서 제외한다.
- 비활성 카테고리는 히스토리와 리포트의 기존 세션에서는 계속 표시한다.
- 비활성 카테고리는 Settings에서 별도 상태로 표시하고, 후속 작업에서 복구 버튼을 추가할 수 있다.

후순위로 검토할 예외:

- 한 번도 세션에서 사용되지 않은 사용자 카테고리는 실제 삭제를 허용할 수 있다.
- 단, MVP 다음 작업에서는 정책 단순성을 위해 비활성화만 먼저 구현한다.

## 결정 2. `categories.is_active`를 추가한다

다음 구현 회차에서는 `categories`에 `is_active boolean not null default true`를 추가한다.

권장 SQL 초안:

```sql
alter table public.categories
add column if not exists is_active boolean not null default true;

create index if not exists categories_user_active_idx
  on public.categories (user_id, is_active);
```

RLS는 기존 사용자별 update 정책을 유지해도 되지만, 서버 액션에서는 반드시 아래 조건을 걸어 업데이트한다.

```ts
.eq("id", categoryId)
.eq("user_id", authState.user.id)
.eq("is_default", false)
```

비활성화 액션은 `delete`가 아니라 아래 update를 사용한다.

```ts
update({ is_active: false })
```

## 결정 3. 기본 집중/휴식 시간은 `user_settings`에 저장한다

기본 집중 시간과 기본 휴식 시간은 `daily_goals`나 `users`가 아니라 별도 `user_settings` 테이블에 저장한다.

이유:

- `daily_goals`는 날짜별 목표이고, timer preset은 사용자 환경설정이다.
- `users`는 인증 프로필 성격이 강해서 설정 필드가 계속 늘어날수록 책임이 흐려진다.
- 알림 on/off, 기본 카테고리, 표시 옵션 같은 후속 설정을 확장하기 쉽다.

권장 스키마:

```sql
create table if not exists public.user_settings (
  user_id uuid primary key references public.users (id) on delete cascade,
  default_focus_minutes integer not null default 25,
  default_break_minutes integer not null default 5,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint user_settings_default_focus_minutes_check
    check (default_focus_minutes between 1 and 180),
  constraint user_settings_default_break_minutes_check
    check (default_break_minutes between 0 and 60)
);

drop trigger if exists set_user_settings_updated_at on public.user_settings;
create trigger set_user_settings_updated_at
before update on public.user_settings
for each row execute procedure public.set_updated_at();

alter table public.user_settings enable row level security;

drop policy if exists "Users can manage their own settings" on public.user_settings;
create policy "Users can manage their own settings"
on public.user_settings
for all
to authenticated
using (auth.uid() is not null and auth.uid() = user_id)
with check (auth.uid() is not null and auth.uid() = user_id);
```

서버 validation:

- `default_focus_minutes`: 1~180분
- `default_break_minutes`: 0~60분

UI 기본값:

- 저장값이 없으면 집중 25분, 휴식 5분을 사용한다.

## 화면별 영향 범위

### `/settings`

- 기본 집중 시간과 기본 휴식 시간 입력 필드를 추가한다.
- 카테고리 목록에서 active/inactive 상태를 구분한다.
- 사용자 카테고리에는 비활성화 버튼을 추가한다.
- 기본 카테고리는 계속 읽기 전용으로 표시한다.

### `/timer`

- 시작 폼의 기본값을 `user_settings`에서 읽는다.
- active 카테고리만 선택 목록에 표시한다.
- 비활성 카테고리는 새 세션에 선택할 수 없게 한다.

### `/history`

- 기존 세션에 연결된 비활성 카테고리는 그대로 표시한다.
- 필터 목록에 비활성 카테고리를 포함할지 여부는 구현 시 UX를 보고 결정한다.

### `/reports/weekly`

- 기존 세션의 카테고리 집계는 active 여부와 무관하게 유지한다.
- 새 세션 생성에서만 비활성 카테고리를 제외한다.

### `/dashboard`

- 카테고리 비활성화 이후에도 과거 집계가 변하지 않는지 확인한다.
- preset 저장 자체는 대시보드 집계에 직접 영향을 주지 않는다.

## 다음 회차 구현 순서

1. SQL migration 문서 추가
2. `lib/types/database.ts`에 `categories.is_active`와 `user_settings` 타입 반영
3. Settings page data query에 `user_settings` 조회 추가
4. `upsertUserSettingsAction` 추가
5. `deactivateCategoryAction` 추가
6. `/settings` UI에 preset 입력과 카테고리 비활성화 버튼 추가
7. `/timer` 초기값을 `user_settings` 기준으로 연결
8. active 카테고리만 새 세션 선택 목록에 노출
9. `revalidatePath()` 범위 확인
10. lint/build 검증

## 검증 체크리스트

- 사용자가 기본 집중/휴식 시간을 저장할 수 있다.
- `/timer` 진입 시 저장한 집중/휴식 시간이 기본 입력값으로 표시된다.
- 사용자 카테고리를 비활성화할 수 있다.
- 비활성화된 카테고리는 새 세션 선택 목록에서 제외된다.
- 비활성화된 카테고리가 연결된 기존 세션은 히스토리와 리포트에서 계속 표시된다.
- 기본 카테고리는 비활성화할 수 없다.
- 다른 사용자의 카테고리나 설정은 조회/수정할 수 없다.
- `npm run lint`가 통과한다.
- `npm run build`가 통과한다.

## 이번 회차 완료 범위

- 카테고리 삭제/비활성화 정책 확정
- `categories.is_active` 스키마 방향 확정
- `user_settings` 테이블 신설 방향 확정
- 다음 구현 회차 작업 순서와 검증 기준 정리

## 남은 작업

- SQL migration 파일 또는 기존 SQL 문서 반영
- Supabase 타입 갱신
- Settings preset 저장 액션 구현
- 카테고리 비활성화 액션 구현
- `/settings` UI 반영
- `/timer` 기본값과 active 카테고리 필터 반영
- 전체 집계 화면 재검증
