"use server";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function toPositiveInt(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

function toGoalDate(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

export async function upsertDailyGoalAction(formData: FormData) {
  const authState = await getAuthUser();
  if (!authState) {
    throw new Error("로그인이 필요합니다.");
  }

  const goalDate = toGoalDate(formData.get("goalDate"));
  if (!goalDate) {
    throw new Error("유효한 목표 날짜가 필요합니다.");
  }

  const targetFocusMinutes = toPositiveInt(
    formData.get("targetFocusMinutes"),
    120,
  );
  const targetSessions = toPositiveInt(formData.get("targetSessions"), 4);
  const targetDaysPerWeek = toPositiveInt(
    formData.get("targetDaysPerWeek"),
    5,
  );

  const supabase = await createClient();
  const { error } = await supabase.from("daily_goals").upsert(
    {
      user_id: authState.user.id,
      goal_date: goalDate,
      target_focus_minutes: targetFocusMinutes,
      target_sessions: targetSessions,
      target_days_per_week: targetDaysPerWeek,
    },
    {
      onConflict: "user_id,goal_date",
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  redirect("/settings?saved=goal");
}
