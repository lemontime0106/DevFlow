import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">회원가입이 완료되었습니다.</CardTitle>
              <CardDescription>이메일 인증을 마치면 바로 시작할 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                인증 메일의 링크를 누르면 DevFlow 대시보드로 이동합니다. 메일이
                보이지 않으면 스팸함도 확인해 주세요.
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/auth/login">로그인 화면으로 이동</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
