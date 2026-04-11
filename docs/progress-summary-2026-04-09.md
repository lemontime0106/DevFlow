# DevFlow 작업 요약

작성일: 2026-04-09

## 이번에 진행한 범위

- 1단계 프로젝트 기반 정리
- 인증 흐름 정리
- Supabase 연결 확인
- MVP 기준 DB 스키마 초안 작성 및 실제 프로젝트 반영

## 1. 프로젝트 기반 정리

### 구조 정리

- 스타터 템플릿 중심 랜딩을 DevFlow 소개 페이지로 교체
- 공통 앱 셸을 `components/layout/app-shell.tsx`로 분리
- 사이트/라우트 기준 설정을 `lib/config/site.ts`로 분리
- 인증 컴포넌트를 `components/auth` 아래로 정리

### 라우트 기준

현재 기준 주요 라우트:

- `/`
- `/auth/login`
- `/auth/sign-up`
- `/dashboard`
- `/timer`
- `/history`
- `/reports/weekly`
- `/settings`

### 문서/환경 변수 정리

- `README.md`를 DevFlow 기준으로 전면 정리
- `docs/project-foundation.md`에 현재 구조 기준 반영
- `.env.example`에 공개/비공개 Supabase 환경 변수 역할 정리

## 2. 인증 흐름 정리

### 반영 내용

- 로그인/회원가입/비밀번호 재설정 UI 문구를 DevFlow 문맥으로 수정
- 로그인 성공 시 `/dashboard`로 이동
- 회원가입 메일 인증 완료 시 `/dashboard`로 이동
- 로그인된 사용자가 `/auth/login`, `/auth/sign-up` 접근 시 `/dashboard`로 리다이렉트
- 인증 에러/회원가입 성공 페이지를 한국어 안내 흐름으로 정리

### 관련 파일

- `app/auth/login/page.tsx`
- `app/auth/sign-up/page.tsx`
- `app/auth/error/page.tsx`
- `app/auth/sign-up-success/page.tsx`
- `app/auth/confirm/route.ts`
- `lib/auth/get-auth-user.ts`

## 3. Supabase 연결 상태

### 환경 변수 기준

현재 사용 기준:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_DB_PASSWORD`

### 코드 연결

- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/proxy.ts`

위 파일들에 Supabase 타입을 연결했고, 대시보드에서 실제 로그인 사용자 세션과 프로젝트 연결 상태를 확인할 수 있게 구성함.

## 4. DB 스키마 작업

### 실제 반영된 Supabase 프로젝트

- project ref: `tyissopjmpgcrurcgxkv`
- project name: `devflow`

### 생성/반영된 테이블

- `public.users`
- `public.categories`
- `public.sessions`
- `public.daily_goals`

### 스키마 설계 포인트

- `public.users`
  - `auth.users`와 1:1 대응되는 프로필 테이블
  - 신규 가입 시 trigger로 자동 동기화

- `public.categories`
  - 기본 카테고리 + 사용자 커스텀 카테고리 구조
  - 기본 카테고리는 `user_id = null`, `is_default = true`

- `public.sessions`
  - 집중 세션 원본 데이터 저장
  - 상태: `active`, `completed`, `cancelled`, `interrupted`
  - 난이도: `easy`, `normal`, `hard`
  - 자가평가: 1~5

- `public.daily_goals`
  - 날짜별 목표 저장
  - 사용자/날짜 unique 제약 적용

### 기본 seed

기본 카테고리 5개 반영:

- Feature Development
- Bug Fixing
- Refactoring
- Meeting
- Learning

### 보안 정책

모든 `public` 테이블에 대해 RLS 활성화.

- `users`: 본인 프로필만 조회/수정 가능
- `categories`: 기본 카테고리는 읽기 가능, 사용자 카테고리는 본인만 생성/수정/삭제 가능
- `sessions`: 본인 데이터만 전체 관리 가능
- `daily_goals`: 본인 데이터만 전체 관리 가능

### SQL 문서

- `docs/sql/001_mvp_foundation.sql`

## 5. 타입 정리

### 도메인 타입

- `lib/types/domain.ts`
  - `UserProfile`
  - `Category`
  - `FocusSession`
  - `DailyGoal`
  - `TimerPreset`
  - `SessionDraft`
  - 대시보드/리포트 타입

### DB 타입

- `lib/types/database.ts`
  - Supabase 프로젝트 기준 테이블 타입 반영

## 6. 검증 결과

- `npm run lint` 통과
- Supabase security advisor 경고 해소 완료
- 대시보드에서 서버 컴포넌트 기반 사용자 세션 확인 가능하도록 연결

## 7. 현재 남아 있는 작업

다음 우선순위 후보:

1. `sessions` 테이블에 실제 타이머 저장 로직 연결
2. 세션 종료 후 기록 입력 폼 구현
3. 히스토리 조회 및 필터링 연결
4. 일간 대시보드 집계 로직 구현

## 8. 참고 문서

- `WORK_ORDER.md`
- `docs/project-foundation.md`
- `docs/auth-and-db-plan.md`
- `docs/sql/001_mvp_foundation.sql`
