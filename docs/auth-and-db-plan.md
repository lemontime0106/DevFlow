# DevFlow 인증/DB 연결 계획

## 인증 흐름

- `/auth/login`, `/auth/sign-up`는 로그인하지 않은 사용자만 접근
- 인증된 사용자가 인증 페이지에 접근하면 `/dashboard`로 이동
- 회원가입 후 메일 인증을 완료하면 `/dashboard`로 진입
- 인증 오류는 DevFlow 문맥에 맞는 안내 문구로 노출

## DB 설계 기준

MVP 첫 단계에서는 아래 테이블부터 사용한다.

- `public.users`
  - `auth.users`를 기준으로 동기화되는 프로필 테이블
- `public.categories`
  - 기본 카테고리 + 사용자 커스텀 카테고리
- `public.sessions`
  - 집중 세션 원본 데이터
- `public.daily_goals`
  - 날짜별 목표 설정

## 보안 기준

- `public` 스키마 테이블은 모두 RLS 활성화
- 모든 사용자 데이터는 `auth.uid()` 기준으로 소유자만 접근
- 기본 카테고리는 `user_id is null`로 저장하고 읽기만 허용

## 기본 seed

- Feature Development
- Bug Fixing
- Refactoring
- Meeting
- Learning
