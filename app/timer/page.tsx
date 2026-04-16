import { TimerWorkspace } from "@/components/timer/timer-workspace";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { getTimerPageData } from "@/lib/sessions/queries";
import { redirect } from "next/navigation";
import { Suspense } from "react";

function TimerFallback() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-0">
      <div className="devflow-panel p-8">
        <div className="devflow-skeleton h-4 w-24" />
        <div className="devflow-skeleton mt-3 h-10 w-80" />
      </div>
    </section>
  );
}

async function TimerContent() {
  const authState = await getAuthUser();

  if (!authState) {
    redirect("/auth/login");
  }

  const data = await getTimerPageData(authState.user.id);

  return <TimerWorkspace data={data} />;
}

export default function TimerPage() {
  return (
    <Suspense fallback={<TimerFallback />}>
      <TimerContent />
    </Suspense>
  );
}
