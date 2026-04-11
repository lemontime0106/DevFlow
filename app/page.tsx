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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_hsl(163_70%_94%),_transparent_26%),radial-gradient(circle_at_bottom_right,_hsl(38_100%_94%),_transparent_24%),linear-gradient(180deg,_hsl(0_0%_100%),_hsl(210_33%_98%))]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4 sm:px-6">
        <header className="rounded-3xl border border-border/70 bg-background/85 px-4 py-4 shadow-sm backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Suspense
              fallback={
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
                    {siteConfig.name}
                  </p>
                  <h1 className="mt-1 text-lg font-semibold tracking-tight">
                    Developer focus tracking with rule-based insights
                  </h1>
                </div>
              }
            >
              <BrandLink
                subtitle="Developer focus tracking with rule-based insights"
                titleClassName="mt-1 text-lg font-semibold tracking-tight"
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

        <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          <div className="space-y-6 rounded-[2rem] border border-border/70 bg-background/90 p-8 shadow-sm">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">
                MVP Foundation
              </p>
              <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                집중 시간을 기록하고, 주간 패턴으로 해석하는 개발자용 워크로그.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {siteConfig.description} 지금 단계에서는 서비스 구조, 인증 동선,
                기본 라우트를 먼저 고정해 이후 타이머와 리포트 구현이 흔들리지
                않도록 정리했습니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link href="/auth/sign-up">회원가입 시작</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-6"
              >
                <Link href="/dashboard">앱 구조 보기</Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {appNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-border/70 bg-muted/40 p-5 transition hover:-translate-y-0.5 hover:bg-muted/70"
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
            <section className="rounded-[2rem] border border-border/70 bg-slate-950 p-6 text-slate-50 shadow-sm">
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">
                Why DevFlow
              </p>
              <ul className="mt-4 space-y-4 text-sm leading-6 text-slate-200">
                <li>단순 타이머가 아니라 집중 데이터를 분석 가능한 형태로 남깁니다.</li>
                <li>오늘의 집중 상태와 주간 패턴을 같은 흐름 안에서 이어봅니다.</li>
                <li>기록, 집계, 인사이트가 단계별로 확장되는 MVP 구조를 지향합니다.</li>
              </ul>
            </section>

            <section className="rounded-[2rem] border border-border/70 bg-background/90 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Step 1 Deliverables
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                {foundationChecklist.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[2rem] border border-border/70 bg-background/90 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Stack
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {siteConfig.stack.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-sm text-foreground"
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
