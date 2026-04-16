import { AuthButton } from "@/components/auth/auth-button";
import { BrandLink } from "@/components/layout/brand-link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  appNavigation,
  foundationChecklist,
  siteConfig,
} from "@/lib/config/site";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background devflow-subtle-grid">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4 sm:px-6">
        <header className="rounded-lg border border-border bg-secondary/90 px-4 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Suspense
              fallback={
                <div>
                  <p className="devflow-kicker">
                    {siteConfig.name}
                  </p>
                  <h1 className="mt-1 text-lg font-semibold">
                    Developer focus tracking with rule-based insights
                  </h1>
                </div>
              }
            >
              <BrandLink
                subtitle="Developer focus tracking with rule-based insights"
                titleClassName="mt-1 text-lg font-semibold"
              />
            </Suspense>
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

        <section className="grid flex-1 gap-6 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="devflow-panel space-y-6 p-6 sm:p-8">
            <div className="space-y-4">
              <p className="devflow-kicker">
                Focus Log Analytics
              </p>
              <h2 className="max-w-3xl text-4xl font-semibold text-foreground sm:text-5xl">
                집중 시간을 코드 로그처럼 기록하고 분석합니다.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {siteConfig.description} 세션, 카테고리, 중단 신호를 한 흐름으로
                모아 오늘의 집중 상태와 주간 패턴을 읽습니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="px-6">
                <Link href="/auth/sign-up">회원가입 시작</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="px-6"
              >
                <Link href="/dashboard">대시보드 보기</Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {appNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg border border-border bg-secondary/70 p-5 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[#2F3A49] hover:bg-[#1B222C] active:scale-[0.98]"
                >
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.summary}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <section className="devflow-panel p-6">
              <p className="devflow-kicker">
                Signal
              </p>
              <ul className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">
                <li>단순 타이머가 아니라 집중 데이터를 분석 가능한 형태로 남깁니다.</li>
                <li>오늘의 집중 상태와 주간 패턴을 같은 흐름 안에서 이어봅니다.</li>
                <li>기록, 집계, 인사이트가 단계별로 확장되는 MVP 구조를 지향합니다.</li>
              </ul>
            </section>

            <section className="devflow-panel p-6">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Core Flow
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                {foundationChecklist.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="devflow-panel p-6">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Stack
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {siteConfig.stack.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-sm text-primary"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
