# DevFlow

DevFlow는 개발자를 위한 집중 세션 기록과 룰 기반 분석 서비스입니다.

단순히 타이머를 켜고 끄는 도구가 아니라, 개발 작업을 세션 단위로 남기고 일간 대시보드와 주간 리포트에서 패턴을 읽어내는 것을 목표로 합니다. 사용자는 오늘 얼마나 집중했는지, 어떤 카테고리에 시간이 몰렸는지, 어느 시간대에 집중이 잘 됐는지, 중단이 잦은지 같은 흐름을 확인할 수 있습니다.

Production URL:

```txt
https://devflow-omega-one.vercel.app
```

## 문제 정의

개발자는 긴 시간을 앉아 있어도 실제로 어떤 작업에 얼마나 몰입했는지 기억하기 어렵습니다. 일반적인 타이머는 시간을 재는 데는 충분하지만, 시간이 쌓인 뒤 "내가 어떤 방식으로 일하고 있는지"를 설명해주지는 않습니다.

DevFlow는 다음 질문에 답하는 데 초점을 둡니다.

- 오늘 실제로 완료한 집중 세션은 몇 개인가?
- 목표 집중 시간까지 얼마나 남았는가?
- 이번 주에 가장 많은 시간을 쓴 작업 카테고리는 무엇인가?
- 집중이 잘 되는 시간대가 있는가?
- 중단 비율이나 작업 전환이 높아지는 패턴이 있는가?

## 누구를 위한 서비스인가

DevFlow는 자기 작업 흐름을 기록하고 개선하고 싶은 개발자를 위한 서비스입니다.

- 포모도로나 딥워크 방식으로 집중 시간을 관리하는 개발자
- 작업 시간을 단순 출퇴근 시간이 아니라 세션 단위로 보고 싶은 사람
- 사이드 프로젝트, 취업 준비, 학습 루틴을 꾸준히 추적하고 싶은 사람
- 회고나 주간 리포트를 쓸 때 근거가 되는 작업 데이터를 남기고 싶은 사람
- "오래 앉아 있었는지"보다 "어떤 흐름으로 집중했는지"가 궁금한 사람

## 차별점

### 1. 타이머 이후의 분석까지 연결

일반적인 타이머는 세션이 끝나면 역할이 끝납니다. DevFlow는 세션 종료 후 제목, 카테고리, 난이도, 집중도, 메모를 함께 저장하고 이 데이터를 대시보드와 주간 리포트로 이어갑니다.

### 2. 개발 작업에 맞춘 카테고리 구조

기본 카테고리로 Feature Development, Bug Fixing, Refactoring, Meeting, Learning을 제공하고, 사용자가 직접 카테고리를 추가하거나 수정할 수 있습니다. 단순 시간 기록이 아니라 개발 작업의 맥락을 함께 남기는 구조입니다.

### 3. 룰 기반 인사이트

AI 기능에 먼저 의존하지 않고, 현재 기록된 세션 데이터를 바탕으로 완주율, 중단률, 카테고리 편중, 시간대별 집중 흐름 같은 규칙 기반 인사이트를 만듭니다. 데이터가 적어도 설명 가능한 방식으로 동작하는 것이 목표입니다.

### 4. 목표와 실제 기록의 연결

Settings에서 일일 집중 시간, 목표 세션 수, 주간 목표 일수를 저장하고 대시보드에서 진행률과 남은 집중 시간을 확인할 수 있습니다. 사용자는 목표와 실제 기록의 차이를 바로 볼 수 있습니다.

### 5. 운영 분석 확장 준비

Google Tag Manager 컨테이너가 설치되어 있어 GA4 측정 ID가 준비되면 페이지뷰와 핵심 이벤트 추적을 이어서 붙일 수 있습니다.

## 현재 구현된 기능

- 회원가입 / 로그인 / 로그아웃
- 이메일 미인증 안내와 인증 메일 재전송
- 집중 세션 시작
- 세션 일시정지 / 재개
- 세션 취소
- 세션 종료 후 기록 저장
- 히스토리 조회와 상태/카테고리/날짜 필터링
- 일간 대시보드 집계
- 오늘 목표 진행률과 남은 집중 시간 표시
- 주간 리포트 집계와 기본 인사이트
- Settings에서 일일 목표 저장
- 사용자 커스텀 카테고리 생성
- 사용자 커스텀 카테고리 이름/색상 수정
- 기본 카테고리와 사용자 카테고리 표시
- Google Tag Manager 컨테이너 설치

## 주요 화면

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

## 기술 스택

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- shadcn/ui 기반 UI 컴포넌트
- Vercel
- Google Tag Manager

## 데이터 모델

핵심 테이블은 다음 흐름을 기준으로 설계했습니다.

- `users`: Supabase Auth 사용자와 연결되는 프로필
- `categories`: 기본 카테고리와 사용자 커스텀 카테고리
- `sessions`: 집중 세션 원본 기록
- `daily_goals`: 날짜별 목표 집중 시간, 목표 세션 수, 주간 목표 일수

자세한 SQL 기준은 [docs/sql/001_mvp_foundation.sql](./docs/sql/001_mvp_foundation.sql)에서 관리합니다.

## 프로젝트 문서

- [WORK_ORDER.md](./WORK_ORDER.md): 초기 구현 계획
- [docs/project-foundation.md](./docs/project-foundation.md): 프로젝트 구조와 기반 설계
- [docs/work-log-2026-04-12.md](./docs/work-log-2026-04-12.md): 최근 작업 로그
- [docs/work-log-2026-05-02.md](./docs/work-log-2026-05-02.md): 카테고리/Settings preset 정책 작업 로그
- [docs/phase-1-category-and-settings-plan.md](./docs/phase-1-category-and-settings-plan.md): 카테고리 비활성화 정책과 Settings preset 설계
- [docs/remaining-work-queue-2026-04-12.md](./docs/remaining-work-queue-2026-04-12.md): 남은 작업 큐
- [docs/next-work-roadmap-2026-04-12.md](./docs/next-work-roadmap-2026-04-12.md): 기능 확장과 고도화 로드맵

## 다음 작업

우선순위가 높은 남은 작업은 다음과 같습니다.

- 카테고리 비활성화 기능 구현
- `categories.is_active`와 `user_settings` SQL migration 추가
- Settings 기본 집중/휴식 preset UI 구현
- 세션 기록 수정 기능
- 대시보드 목표 달성 예상 상태
- 주간 리포트 지난주 대비 지표
- GA4 측정 ID 연결과 GTM 태그 게시
- 핵심 이벤트 추적
- 배포 품질 체크리스트 정리

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
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Vercel 배포 후에는 `NEXT_PUBLIC_SITE_URL`을 실제 서비스 주소로 설정하면 canonical URL, Open Graph URL, `sitemap.xml`, `robots.txt`가 같은 주소를 기준으로 생성됩니다.

## Verification

```bash
npm run lint
npm run build
```
