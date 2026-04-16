import { SignUpForm } from "@/components/auth/sign-up-form";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { redirect } from "next/navigation";
import { Suspense } from "react";

function SignUpPageFallback() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="h-96 w-full max-w-sm rounded-lg border border-border bg-card" />
    </div>
  );
}

async function SignUpPageContent() {
  const authState = await getAuthUser();

  if (authState) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<SignUpPageFallback />}>
      <SignUpPageContent />
    </Suspense>
  );
}
