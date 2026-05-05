"use server";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function toPositiveInt(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

function toBoundedInt(
  value: FormDataEntryValue | null,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function toGoalDate(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function toCategoryName(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim().replace(/\s+/g, " ");
  return text.length >= 1 && text.length <= 40 ? text : null;
}

function toHexColor(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return /^#[0-9A-Fa-f]{6}$/.test(text) ? text : "#10b981";
}

function toUuid(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    text,
  )
    ? text
    : null;
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

export async function upsertUserSettingsAction(formData: FormData) {
  const authState = await getAuthUser();
  if (!authState) {
    throw new Error("로그인이 필요합니다.");
  }

  const defaultFocusMinutes = toBoundedInt(
    formData.get("defaultFocusMinutes"),
    25,
    1,
    180,
  );
  const defaultBreakMinutes = toBoundedInt(
    formData.get("defaultBreakMinutes"),
    5,
    0,
    60,
  );

  const supabase = await createClient();
  const { error } = await supabase.from("user_settings").upsert({
    user_id: authState.user.id,
    default_focus_minutes: defaultFocusMinutes,
    default_break_minutes: defaultBreakMinutes,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/settings");
  revalidatePath("/timer");
  redirect("/settings?saved=settings");
}

export async function createCategoryAction(formData: FormData) {
  const authState = await getAuthUser();
  if (!authState) {
    throw new Error("로그인이 필요합니다.");
  }

  const name = toCategoryName(formData.get("categoryName"));
  if (!name) {
    redirect("/settings?error=invalid-category");
  }

  const color = toHexColor(formData.get("categoryColor"));
  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    user_id: authState.user.id,
    name,
    color,
    is_default: false,
  });

  if (error) {
    if (error.code === "23505") {
      redirect("/settings?error=duplicate-category");
    }

    throw new Error(error.message);
  }

  revalidatePath("/settings");
  revalidatePath("/timer");
  revalidatePath("/history");
  revalidatePath("/reports/weekly");
  revalidatePath("/dashboard");
  redirect("/settings?saved=category");
}

export async function updateCategoryAction(formData: FormData) {
  const authState = await getAuthUser();
  if (!authState) {
    throw new Error("로그인이 필요합니다.");
  }

  const categoryId = toUuid(formData.get("categoryId"));
  const name = toCategoryName(formData.get("categoryName"));
  if (!categoryId || !name) {
    redirect("/settings?error=invalid-category");
  }

  const color = toHexColor(formData.get("categoryColor"));
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .update({
      name,
      color,
    })
    .eq("id", categoryId)
    .eq("user_id", authState.user.id)
    .eq("is_default", false)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      redirect("/settings?error=duplicate-category");
    }

    throw new Error(error.message);
  }

  if (!data) {
    redirect("/settings?error=category-not-found");
  }

  revalidatePath("/settings");
  revalidatePath("/timer");
  revalidatePath("/history");
  revalidatePath("/reports/weekly");
  revalidatePath("/dashboard");
  redirect("/settings?saved=category-updated");
}

export async function deactivateCategoryAction(formData: FormData) {
  const authState = await getAuthUser();
  if (!authState) {
    throw new Error("로그인이 필요합니다.");
  }

  const categoryId = toUuid(formData.get("categoryId"));
  if (!categoryId) {
    redirect("/settings?error=category-not-found");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .update({ is_active: false })
    .eq("id", categoryId)
    .eq("user_id", authState.user.id)
    .eq("is_default", false)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    redirect("/settings?error=category-not-found");
  }

  revalidatePath("/settings");
  revalidatePath("/timer");
  revalidatePath("/history");
  revalidatePath("/reports/weekly");
  revalidatePath("/dashboard");
  redirect("/settings?saved=category-deactivated");
}
