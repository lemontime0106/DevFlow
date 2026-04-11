import { AppShell } from "@/components/layout/app-shell";

export default function TimerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
