import { LoginForm } from "@/components/auth/login-form";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { redirect } from "next/navigation";
import { Suspense } from "react";

function LoginPageFallback() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="h-80 w-full max-w-sm rounded-lg border border-border bg-card" />
    </div>
  );
}

async function LoginPageContent() {
  const authState = await getAuthUser();

  if (authState) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
