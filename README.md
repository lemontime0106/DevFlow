# DevFlow

DevFlow는 개발자를 위한 집중 시간 기록 + 룰 기반 분석 서비스입니다.
단순 타이머에서 끝나지 않고, 세션 데이터를 쌓아 일간 대시보드와 주간 리포트로 패턴을 읽어내는 MVP를 목표로 합니다.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth / Postgres
- shadcn/ui

## Current Scope

- 회원가입 / 로그인
- 집중 세션 시작 / 종료
- 세션 기록 저장
- 오늘 대시보드
- 주간 집계
- 기본 인사이트 3종

자세한 작업 순서는 [WORK_ORDER.md](./WORK_ORDER.md), 프로젝트 기반 기준은 [docs/project-foundation.md](./docs/project-foundation.md)에서 관리합니다.

## Routes

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

## Local Setup

1. `.env.example`를 참고해 `.env.local`을 만듭니다.
2. Supabase 프로젝트의 URL과 publishable key를 채웁니다.
3. 개발 서버를 실행합니다.

```bash
npm run dev
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Foundation Notes

- 스타터 템플릿 문구와 보호 페이지 흐름을 DevFlow 기준으로 정리했습니다.
- 인증 관련 컴포넌트는 `components/auth`에 모아 관리합니다.
- 앱 공통 셸과 내비게이션 기준은 `components/layout`, `lib/config`에 분리했습니다.
- 분석 로직은 이후 `lib/analytics` 하위로 확장할 예정입니다.
