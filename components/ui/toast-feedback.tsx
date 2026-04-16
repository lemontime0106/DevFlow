"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ToastFeedbackProps {
  message: string | null;
  tone?: "success" | "info" | "error";
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
        "fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur",
        tone === "success" &&
          "border-green-500/30 bg-green-500/10 text-foreground",
        tone === "info" &&
          "border-primary/30 bg-primary/10 text-foreground",
        tone === "error" &&
          "border-red-500/30 bg-red-500/12 text-foreground",
      )}
      role="status"
      aria-live="polite"
    >
      {tone === "success" ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
      ) : tone === "info" ? (
        <Info className="mt-0.5 h-4 w-4 text-primary" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 text-red-600 dark:text-red-400" />
      )}
      <p className="text-sm leading-6">{message}</p>
    </div>
  );
}
