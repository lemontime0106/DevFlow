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
    <main className="min-h-screen bg-background devflow-subtle-grid">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6">
        <header className="sticky top-4 z-20 rounded-lg border border-border bg-secondary/90 px-4 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <Suspense
                fallback={
                  <Link href="/dashboard" className="space-y-1">
                    <p className="devflow-kicker">
                      {siteConfig.name}
                    </p>
                    <h1 className="text-lg font-semibold text-foreground">
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
                  className="rounded-md border border-transparent px-3 py-1.5 text-muted-foreground transition duration-200 ease-out hover:border-[#2F3A49] hover:bg-[#1B222C] hover:text-foreground active:scale-[0.98]"
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
