import { HistoryList } from "@/components/history/history-list";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { getHistoryPageData } from "@/lib/sessions/queries";
import { redirect } from "next/navigation";
import { Suspense } from "react";

function HistoryFallback() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-0">
      <div className="devflow-panel p-8">
        <div className="devflow-skeleton h-4 w-20" />
        <div className="devflow-skeleton mt-3 h-10 w-72" />
      </div>
    </section>
  );
}

async function HistoryContent({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    categoryId?: string;
    date?: string;
  }>;
}) {
  const authState = await getAuthUser();

  if (!authState) {
    redirect("/auth/login");
  }

  const filters = await searchParams;
  const data = await getHistoryPageData(authState.user.id, filters);

  return <HistoryList data={data} filters={filters} />;
}

export default function HistoryPage(props: {
  searchParams: Promise<{
    status?: string;
    categoryId?: string;
    date?: string;
  }>;
}) {
  return (
    <Suspense fallback={<HistoryFallback />}>
      <HistoryContent {...props} />
    </Suspense>
  );
}
