"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { isUuid } from "@/lib/plans";

// Screen 11 · "Wie war's?" – the main pilot metric (attended yes/no per person)
export async function saveReview(formData: FormData) {
  const planId = String(formData.get("plan_id") ?? "");
  if (!isUuid(planId)) redirect("/");
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/plans/${planId}/review`);

  const supabase = await createClient();
  const { data: plan } = await supabase.from("plans").select("id,initiator_id,starts_at").eq("id", planId).maybeSingle();
  if (!plan || new Date(plan.starts_at).getTime() > Date.now()) redirect(`/plans/${planId}`);
  const isInitiator = plan.initiator_id === user.id;

  const { data: rows } = await supabase
    .from("plan_participants")
    .select("user_id,attended_reported_by")
    .eq("plan_id", planId)
    .eq("status", "going");

  let anyoneWent = false;
  for (const row of rows ?? []) {
    const value = formData.get(`attended_${row.user_id}`);
    if (value !== "yes" && value !== "no") continue;
    const isSelf = row.user_id === user.id;
    if (!isSelf && !isInitiator) continue; // invitees only answer for themselves
    // What a person says about herself wins over what the initiator says about her.
    if (!isSelf && row.attended_reported_by === row.user_id) continue;
    if (value === "yes") anyoneWent = true;
    await supabase
      .from("plan_participants")
      .update({ attended: value === "yes", attended_reported_by: user.id })
      .eq("plan_id", planId)
      .eq("user_id", row.user_id);
  }

  if (isInitiator) {
    const note = String(formData.get("note") ?? "").trim();
    await supabase
      .from("plans")
      .update({ reviewed_at: new Date().toISOString(), review_note: note || null })
      .eq("id", planId);
  }

  revalidatePath("/");
  redirect(`/plans/${planId}/review?saved=${anyoneWent ? "went" : "not"}`);
}
