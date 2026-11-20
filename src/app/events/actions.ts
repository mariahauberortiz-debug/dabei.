"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { berlinEndOfDayISO, berlinLocalToISO } from "@/lib/dates";
import { isUuid } from "@/lib/plans";
import { SUPABASE_URL } from "@/lib/supabase/config";

const text = (v: FormDataEntryValue | null) => (typeof v === "string" && v.trim() ? v.trim() : null);

function cleanUrl(v: string | null) {
  if (!v) return null;
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    return new URL(withScheme).toString();
  } catch {
    return null;
  }
}

/** Date + start/end time + "runs until" → starts_at / ends_at (Berlin time). */
function readTimes(formData: FormData) {
  const date = text(formData.get("date"));
  const startTime = text(formData.get("start_time"));
  const endTime = text(formData.get("end_time"));
  const endsOn = text(formData.get("ends_on"));

  const starts_at = date ? berlinLocalToISO(`${date}T${startTime ?? "00:00"}`) : null;
  let ends_at: string | null = null;
  if (endsOn) {
    ends_at = berlinEndOfDayISO(endsOn);
  } else if (date && endTime) {
    ends_at = berlinLocalToISO(`${date}T${endTime}`);
    // Ends after midnight (e.g. 22:00–02:00) → next day
    if (ends_at && starts_at && ends_at <= starts_at) {
      ends_at = new Date(new Date(ends_at).getTime() + 86_400_000).toISOString();
    }
  }
  // Ignore impossible dates (e.g. a mistyped year like 1901, or an end before the start)
  const plausible = (iso: string | null) => {
    if (!iso) return null;
    const y = new Date(iso).getUTCFullYear();
    return y >= 2024 && y <= 2100 ? iso : null;
  };
  const s = plausible(starts_at);
  let e = plausible(ends_at);
  if (s && e && e < s) e = null;
  return { starts_at: s, ends_at: e };
}

/** Only images from our own storage are accepted. */
function readImage(formData: FormData) {
  const v = text(formData.get("image_url"));
  return v && v.startsWith(`${SUPABASE_URL}/storage/v1/object/public/event-images/`) ? v : null;
}

function readEvent(formData: FormData) {
  return {
    image_url: readImage(formData),
    category: (["kunst", "musik", "essen", "selber", "bewegung", "draussen", "treffen"] as const).find(
      (c) => c === formData.get("category"),
    ) ?? null,
    source: formData.get("curated") === "1" ? ("curated" as const) : ("user" as const),
    title: text(formData.get("title")),
    url: cleanUrl(text(formData.get("url"))),
    location: text(formData.get("location")),
    description: text(formData.get("description")),
    ...readTimes(formData),
  };
}

// Screen 3 · add an own event to "my list"
export async function createEvent(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/events/new");

  const fields = readEvent(formData);
  if (!fields.title) redirect("/events/new?error=title");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .insert({ ...fields, created_by: user.id })
    .select("id")
    .single();

  if (error || !data) redirect("/events/new?error=unknown");

  revalidatePath("/");
  redirect(`/events/${data.id}`);
}

// Edit an event (only the creator, or Haubi as admin – enforced by the database)
export async function updateEvent(formData: FormData) {
  const id = text(formData.get("id"));
  if (!isUuid(id)) redirect("/");
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/events/${id}/edit`);

  const fields = readEvent(formData);
  if (!fields.title) redirect(`/events/${id}/edit?error=title`);

  const supabase = await createClient();
  const { error } = await supabase.from("events").update(fields).eq("id", id);
  if (error) redirect(`/events/${id}/edit?error=unknown`);

  revalidatePath("/");
  redirect(`/events/${id}`);
}

export async function deleteEvent(formData: FormData) {
  const id = text(formData.get("id"));
  if (!id) redirect("/");
  const supabase = await createClient();
  await supabase.from("events").delete().eq("id", id);
  revalidatePath("/");
  redirect("/");
}
