import { FeaturePlaceholder } from "@/components/feature-placeholder";

export default function WeeklyReportsPage() {
  return (
    <FeaturePlaceholder
      title="Weekly Report"
      description="집중 패턴을 시각화하고 룰 기반 분석 결과를 보여주는 DevFlow의 핵심 리포트 화면입니다."
      bullets={[
        "주간 총 집중 시간과 평균 세션 길이",
        "요일별 집중 시간 차트",
        "시간대별 생산성 분석",
        "카테고리 비율과 주간 인사이트 카드",
      ]}
    />
  );
}
