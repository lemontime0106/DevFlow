"use server";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function toPositiveInt(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

function toNullableText(value: FormDataEntryValue | null) {
  if (!value) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function getElapsedMinutes(
  startedAt: string,
  accumulatedMinutes: number | null | undefined,
) {
  const startedAtMs = new Date(startedAt).getTime();
  const nowMs = Date.now();
  const elapsedSinceStart = Math.max(
    0,
    Math.round((nowMs - startedAtMs) / 60000),
  );

  return Math.max(0, (accumulatedMinutes ?? 0) + elapsedSinceStart);
}

export async function startSessionAction(formData: FormData) {
  const authState = await getAuthUser();
  if (!authState) {
    throw new Error("로그인이 필요합니다.");
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("sessions")
    .select("id")
    .eq("user_id", authState.user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (existing) {
    revalidatePath("/timer");
    return;
  }

  const focusMinutes = toPositiveInt(formData.get("focusMinutes"), 25);
  const breakMinutes = toPositiveInt(formData.get("breakMinutes"), 5);
  const startedAt = new Date().toISOString();

  const { error } = await supabase.from("sessions").insert({
    user_id: authState.user.id,
    started_at: startedAt,
    focus_minutes: focusMinutes,
    break_minutes: breakMinutes,
    planned_minutes: focusMinutes,
    actual_minutes: 0,
    status: "active",
    title: "",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/timer");
  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/reports/weekly");
}

export async function cancelSessionAction(formData: FormData) {
  const authState = await getAuthUser();
  if (!authState) {
    throw new Error("로그인이 필요합니다.");
  }

  const sessionId = String(formData.get("sessionId") ?? "");
  if (!sessionId) return;

  const endedAt = new Date().toISOString();
  const supabase = await createClient();

  const { error } = await supabase
    .from("sessions")
    .update({
      status: "cancelled",
      ended_at: endedAt,
      actual_minutes: 0,
    })
    .eq("id", sessionId)
    .eq("user_id", authState.user.id)
    .eq("status", "active");

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/timer");
  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/reports/weekly");
}

export async function completeSessionAction(formData: FormData) {
  const authState = await getAuthUser();
  if (!authState) {
    throw new Error("로그인이 필요합니다.");
  }

  const sessionId = String(formData.get("sessionId") ?? "");
  if (!sessionId) return;

  const title = String(formData.get("title") ?? "").trim();
  const categoryId = toNullableText(formData.get("categoryId"));
  const difficulty = toNullableText(formData.get("difficulty"));
  const selfRatingRaw = Number(formData.get("selfRating"));
  const selfRating =
    Number.isFinite(selfRatingRaw) && selfRatingRaw >= 1 && selfRatingRaw <= 5
      ? Math.round(selfRatingRaw)
      : null;
  const memo = toNullableText(formData.get("memo"));

  const supabase = await createClient();
  const { data: session, error: fetchError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", authState.user.id)
    .eq("status", "active")
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!session) {
    revalidatePath("/timer");
    return;
  }

  const endedAt = new Date();
  const actualMinutes = Math.max(
    1,
    getElapsedMinutes(session.started_at, session.actual_minutes),
  );

  const { error } = await supabase
    .from("sessions")
    .update({
      title,
      category_id: categoryId,
      difficulty,
      self_rating: selfRating,
      memo,
      status: "completed",
      ended_at: endedAt.toISOString(),
      actual_minutes: actualMinutes,
    })
    .eq("id", sessionId)
    .eq("user_id", authState.user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/timer");
  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/reports/weekly");
}

export async function interruptSessionAction(formData: FormData) {
  const authState = await getAuthUser();
  if (!authState) {
    throw new Error("로그인이 필요합니다.");
  }

  const sessionId = String(formData.get("sessionId") ?? "");
  if (!sessionId) return;

  const supabase = await createClient();
  const { data: session, error: fetchError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", authState.user.id)
    .eq("status", "active")
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!session) {
    revalidatePath("/timer");
    return;
  }

  const { error } = await supabase
    .from("sessions")
    .update({
      status: "interrupted",
      ended_at: new Date().toISOString(),
      actual_minutes: getElapsedMinutes(
        session.started_at,
        session.actual_minutes,
      ),
    })
    .eq("id", sessionId)
    .eq("user_id", authState.user.id)
    .eq("status", "active");

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/timer");
  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/reports/weekly");
}

export async function resumeInterruptedSessionAction(formData: FormData) {
  const authState = await getAuthUser();
  if (!authState) {
    throw new Error("로그인이 필요합니다.");
  }

  const sessionId = String(formData.get("sessionId") ?? "");
  if (!sessionId) return;

  const supabase = await createClient();
  const [{ data: existingActive, error: activeError }, { data: session, error: fetchError }] =
    await Promise.all([
      supabase
        .from("sessions")
        .select("id")
        .eq("user_id", authState.user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle(),
      supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", authState.user.id)
        .eq("status", "interrupted")
        .maybeSingle(),
    ]);

  if (activeError) {
    throw new Error(activeError.message);
  }

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (existingActive || !session) {
    revalidatePath("/timer");
    return;
  }

  const resumedAt = new Date().toISOString();
  const { error } = await supabase
    .from("sessions")
    .update({
      status: "active",
      started_at: resumedAt,
      ended_at: null,
      actual_minutes: session.actual_minutes ?? 0,
    })
    .eq("id", session.id)
    .eq("user_id", authState.user.id)
    .eq("status", "interrupted");

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/timer");
  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/reports/weekly");
}
