"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Info } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ToastFeedbackProps {
  message: string | null;
  tone?: "success" | "info";
}

export function ToastFeedback({
  message,
  tone = "success",
}: ToastFeedbackProps) {
  const [visible, setVisible] = useState(Boolean(message));
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setVisible(Boolean(message));
  }, [message]);

  useEffect(() => {
    if (!message) return;

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
      router.replace(pathname, { scroll: false });
    }, 5000);

    return () => window.clearTimeout(hideTimer);
  }, [message, pathname, router]);

  if (!message || !visible) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur",
        tone === "success"
          ? "border-emerald-500/30 bg-emerald-500/12 text-foreground"
          : "border-sky-500/30 bg-sky-500/12 text-foreground",
      )}
      role="status"
      aria-live="polite"
    >
      {tone === "success" ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Info className="mt-0.5 h-4 w-4 text-sky-600 dark:text-sky-400" />
      )}
      <p className="text-sm leading-6">{message}</p>
    </div>
  );
}
