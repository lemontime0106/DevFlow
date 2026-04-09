import { FeaturePlaceholder } from "@/components/feature-placeholder";

export default function SettingsPage() {
  return (
    <FeaturePlaceholder
      title="Settings"
      description="기본 집중 시간, 휴식 시간, 목표, 알림 설정을 관리하는 개인화 화면입니다."
      bullets={[
        "기본 집중/휴식 시간 설정",
        "일일 집중 목표와 주간 기록 목표",
        "알림 on/off 설정",
        "향후 카테고리 관리 확장",
      ]}
    />
  );
}
