import { AppShell } from "@/components/layout/app-shell";

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
