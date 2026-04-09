import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      {params?.error ? (
        <p className="text-sm text-muted-foreground">
          인증 처리 중 문제가 발생했습니다: {params.error}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          알 수 없는 인증 오류가 발생했습니다.
        </p>
      )}
    </>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">인증을 완료하지 못했습니다.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Suspense>
                <ErrorContent searchParams={searchParams} />
              </Suspense>
              <Button asChild className="w-full">
                <Link href="/auth/login">로그인 화면으로 돌아가기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
