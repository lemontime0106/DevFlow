export const siteConfig = {
  name: "DevFlow",
  shortDescription: "집중 시간을 기록하고 패턴을 분석하는 개발자용 포커스 로그.",
  description:
    "집중 세션을 기록하고, 일간 대시보드와 주간 리포트로 반복 가능한 몰입 루틴을 찾는 서비스입니다.",
  stack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
} as const;

export const appNavigation = [
  {
    href: "/dashboard",
    label: "Dashboard",
    summary: "오늘의 집중 시간과 핵심 지표를 확인합니다.",
  },
  {
    href: "/timer",
    label: "Timer",
    summary: "집중 세션을 시작하고 기록 입력 흐름으로 이어집니다.",
  },
  {
    href: "/history",
    label: "History",
    summary: "날짜와 상태별로 저장된 세션을 조회합니다.",
  },
  {
    href: "/reports/weekly",
    label: "Weekly Report",
    summary: "주간 패턴과 룰 기반 인사이트를 모아봅니다.",
  },
  {
    href: "/settings",
    label: "Settings",
    summary: "기본 시간과 목표, 개인 설정을 관리합니다.",
  },
] as const;

export const foundationChecklist = [
  "기술 스택과 환경 변수 기준 정리",
  "랜딩, 인증, 앱 라우트 역할 구분",
  "도메인 타입 초안과 기능별 폴더 기준 정리",
  "스타터 템플릿 문구와 보호 라우트 흐름 정비",
] as const;
