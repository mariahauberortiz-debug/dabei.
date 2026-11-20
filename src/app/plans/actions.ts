"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { berlinLocalToISO } from "@/lib/dates";
import { getInvite, isUuid } from "@/lib/plans";

const text = (v: FormDataEntryValue | null) => (typeof v === "string" && v.trim() ? v.trim() : null);

// B6 · create a plan with a fixed date for an event
export async function createPlan(formData: FormData) {
  const eventId = text(formData.get("event_id"));
  if (!isUuid(eventId)) redirect("/");
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/events/${eventId}/plan`);

  const startsAt = berlinLocalToISO(text(formData.get("starts_at")) ?? "");
  if (!startsAt) redirect(`/events/${eventId}/plan?error=date`);

  const capRaw = Number(text(formData.get("capacity")));
  const capacity = Number.isInteger(capRaw) && capRaw >= 2 ? capRaw : null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plans")
    .insert({ event_id: eventId, initiator_id: user.id, starts_at: startsAt, capacity, note: text(formData.get("note")) })
    .select("id")
    .single();
  if (error || !data) redirect(`/events/${eventId}/plan?error=unknown`);

  revalidatePath("/");
  redirect(`/plans/${data.id}`);
}

/** Join via invitation token, then show the plan (C2 → C3). */
export async function joinWithToken(token: string, from: string | null) {
  const supabase = await createClient();
  const { data: result } = await supabase.rpc("join_plan", {
    p_token: token,
    p_invited_by: isUuid(from) ? from : null,
  });
  const invite = await getInvite(token);
  if ((result === "joined" || result === "already_in") && invite) {
    revalidatePath("/");
    redirect(`/plans/${invite.plan_id}?joined=1`);
  }
  redirect(`/i/${token}?result=${result ?? "error"}`);
}

export async function joinPlan(formData: FormData) {
  const token = text(formData.get("token")) ?? "";
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/i/${token}`);
  await joinWithToken(token, text(formData.get("from")));
}

// C4 · "Kann nicht"
export async function declinePlan(formData: FormData) {
  const token = text(formData.get("token")) ?? "";
  const from = text(formData.get("from"));
  const user = await getCurrentUser();
  if (user) {
    const supabase = await createClient();
    await supabase.rpc("decline_plan", { p_token: token, p_invited_by: isUuid(from) ? from : null });
    revalidatePath("/");
  }
  redirect(`/i/${token}?result=declined`);
}

// Initiator removes someone from her plan
export async function removeParticipant(formData: FormData) {
  const planId = text(formData.get("plan_id"));
  const userId = text(formData.get("user_id"));
  if (!isUuid(planId) || !isUuid(userId)) redirect("/");
  const supabase = await createClient();
  await supabase.from("plan_participants").delete().eq("plan_id", planId).eq("user_id", userId);
  revalidatePath(`/plans/${planId}`);
  redirect(`/plans/${planId}`);
}
