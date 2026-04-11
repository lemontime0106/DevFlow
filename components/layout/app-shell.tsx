import { AuthButton } from "@/components/auth/auth-button";
import { BrandLink } from "@/components/layout/brand-link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { appNavigation, siteConfig } from "@/lib/config/site";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(162_65%_96%),_transparent_32%),linear-gradient(180deg,_hsl(0_0%_100%),_hsl(210_20%_98%))]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6">
        <header className="sticky top-4 z-20 rounded-3xl border border-border/70 bg-background/85 px-4 py-4 shadow-sm backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <Suspense
                fallback={
                  <Link href="/dashboard" className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
                      {siteConfig.name}
                    </p>
                    <h1 className="text-lg font-semibold tracking-tight text-foreground">
                      Focus tracking for developers
                    </h1>
                  </Link>
                }
              >
                <BrandLink
                  href="/dashboard"
                  subtitle="Focus tracking for developers"
                />
              </Suspense>
            </div>

            <nav className="flex flex-wrap gap-2 text-sm">
              {appNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-transparent px-3 py-1.5 text-muted-foreground transition hover:border-border hover:bg-background hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 self-end lg:self-auto">
              <ThemeSwitcher />
              {hasEnvVars ? (
                <Suspense>
                  <AuthButton />
                </Suspense>
              ) : (
                <Button asChild size="sm" variant="outline">
                  <Link href="/auth/login">Supabase 설정 필요</Link>
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 py-8">{children}</div>
      </div>
    </main>
  );
}
