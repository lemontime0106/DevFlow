import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export async function AuthButton() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Signed in
        </p>
        <p className="max-w-48 truncate text-sm font-medium text-foreground">
          {user.email}
        </p>
      </div>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/auth/login">로그인</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/auth/sign-up">회원가입</Link>
      </Button>
    </div>
  );
}
