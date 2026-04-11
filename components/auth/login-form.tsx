"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function mapAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("email not confirmed")) {
    return "이메일 인증이 아직 완료되지 않았습니다. 메일함에서 인증 링크를 확인해 주세요.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }

  if (normalized.includes("invalid email")) {
    return "올바른 이메일 형식으로 입력해 주세요.";
  }

  if (normalized.includes("email rate limit exceeded")) {
    return "인증 메일 재전송 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  }

  return message;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    setResendMessage(null);
    setNeedsEmailConfirmation(false);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "로그인 중 오류가 발생했습니다.";
      setNeedsEmailConfirmation(
        message.toLowerCase().includes("email not confirmed"),
      );
      setError(
        error instanceof Error
          ? mapAuthErrorMessage(error.message)
          : "로그인 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setResendMessage("먼저 인증 메일을 받을 이메일을 입력해 주세요.");
      return;
    }

    const supabase = createClient();
    setIsResending(true);
    setResendMessage(null);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
        },
      });

      if (error) throw error;

      setResendMessage(
        "인증 메일을 다시 보냈습니다. 메일함과 스팸함을 확인해 주세요.",
      );
    } catch (error: unknown) {
      setResendMessage(
        error instanceof Error
          ? mapAuthErrorMessage(error.message)
          : "인증 메일 재전송 중 오류가 발생했습니다.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">DevFlow 로그인</CardTitle>
          <CardDescription>
            집중 세션과 리포트를 이어서 보기 위해 계정에 로그인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setResendMessage(null);
                  }}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">비밀번호</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    비밀번호 재설정
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                />
              </div>
              {error ? (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
                  <p className="font-medium text-foreground">{error}</p>
                  {needsEmailConfirmation ? (
                    <p className="mt-2 leading-6 text-muted-foreground">
                      인증이 끝나기 전까지는 로그인할 수 없습니다. 방금 가입한 계정이라면
                      아래 버튼으로 인증 메일을 다시 보낼 수 있습니다.
                    </p>
                  ) : null}
                </div>
              ) : null}
              {needsEmailConfirmation ? (
                <div className="rounded-2xl bg-muted/30 p-4 text-sm">
                  <p className="font-medium text-foreground">
                    다음 단계
                  </p>
                  <p className="mt-2 leading-6 text-muted-foreground">
                    1. 메일함에서 DevFlow 인증 메일을 확인합니다.
                    <br />
                    2. 메일의 인증 링크를 누르면 `/dashboard`로 이동합니다.
                    <br />
                    3. 메일이 안 보이면 스팸함을 확인하거나 아래에서 다시 보냅니다.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 w-full"
                    disabled={isResending}
                    onClick={handleResendConfirmation}
                  >
                    {isResending ? "인증 메일 재전송 중..." : "인증 메일 다시 보내기"}
                  </Button>
                  {resendMessage ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {resendMessage}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "로그인 중..." : "로그인"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              아직 계정이 없나요?{" "}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4"
              >
                회원가입
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
