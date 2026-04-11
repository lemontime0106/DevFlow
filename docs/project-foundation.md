# DevFlow 프로젝트 기반 정리

## 목적

이 문서는 DevFlow MVP를 구현할 때 흔들리지 않도록
초기 라우트 구조, 폴더 역할, 환경 변수, 공통 타입 기준을 정리한 문서다.

---

## 기술 스택

- `Next.js` App Router
- `TypeScript`
- `Tailwind CSS`
- `Supabase Auth`
- `Supabase Postgres`

---

## MVP 라우트 구조

초기 구현 기준 라우트는 아래처럼 가져간다.

```txt
/
/auth/login
/auth/sign-up
/dashboard
/timer
/history
/reports/weekly
/settings
```

### 라우트 역할

- `/`
  - 랜딩 페이지
  - 서비스 소개, 핵심 가치, CTA
- `/auth/*`
  - 로그인, 회원가입, 비밀번호 관련 인증 흐름
- `/dashboard`
  - 오늘 집중 시간, 세션 요약, 오늘의 인사이트
- `/timer`
  - 집중 세션 시작, 진행, 종료
- `/history`
  - 저장된 세션 목록과 필터
- `/reports/weekly`
  - 주간 집계와 분석 리포트
- `/settings`
  - 기본 시간, 알림, 목표 설정

---

## 폴더 역할 기준

```txt
app/
  page.tsx                 -> 랜딩
  auth/                    -> 인증 관련 라우트
  dashboard/               -> 일간 대시보드
  timer/                   -> 집중 세션 화면
  history/                 -> 세션 히스토리
  reports/weekly/          -> 주간 리포트
  settings/                -> 사용자 설정

components/
  ui/                      -> 범용 UI 컴포넌트
  auth/                    -> 인증 전용 UI
  layout/                  -> 앱 공통 셸과 네비게이션
  dashboard/               -> 대시보드 전용 카드/섹션
  timer/                   -> 타이머 전용 UI
  reports/                 -> 차트와 리포트 UI

lib/
  config/                  -> 사이트/라우트 기준 설정
  supabase/                -> 클라이언트/서버 Supabase 유틸
  analytics/               -> 집계 및 인사이트 계산
  goals/                   -> 목표/스트릭 계산
  sessions/                -> 세션 도메인 로직
  types/                   -> 공통 타입
  utils.ts                 -> 범용 유틸

docs/
  project-foundation.md    -> 기반 구조 문서
  sql/                     -> 이후 SQL 초안 보관
```

---

## 환경 변수

필수:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

추가 가능:

- `NEXT_PUBLIC_SITE_URL`
  - 배포 주소 기반 canonical URL, sitemap, Open Graph 메타데이터에 사용

---

## 현재 1단계 구현 반영 사항

- 스타터 템플릿 기반 랜딩을 DevFlow 소개 페이지로 교체
- 인증 컴포넌트를 `components/auth`로 정리
- 앱 공통 셸을 `components/layout/app-shell.tsx`로 분리
- 사이트 설정과 앱 네비게이션 기준을 `lib/config/site.ts`로 분리
- `/protected` 경로는 임시 스타터 페이지 대신 `/dashboard`로 연결

---

## 구현 순서상 바로 다음 단계

1. 인증 흐름을 DevFlow 브랜딩 기준으로 정리한다.
2. Supabase DB 테이블 SQL 초안을 만든다.
3. `dashboard`, `timer`, `history` 라우트 뼈대를 추가한다.
4. 공통 도메인 타입과 DB 타입 매핑을 연결한다.

인증/DB 상세 기준은 `docs/auth-and-db-plan.md`, SQL 초안은 `docs/sql/001_mvp_foundation.sql`에서 관리한다.

---

## 설계 원칙

- 먼저 "기록이 되는 흐름"을 완성한다.
- 화면보다 데이터 구조를 먼저 안정화한다.
- 통계와 인사이트는 재사용 가능한 함수 단위로 분리한다.
- 스타터 템플릿 흔적은 초기에 정리해서 이후 구현 비용을 줄인다.
