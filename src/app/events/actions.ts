"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { berlinEndOfDayISO, berlinLocalToISO } from "@/lib/dates";

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

// Screen 3 · add an own event to "my list"
export async function createEvent(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/events/new");

  const title = text(formData.get("title"));
  if (!title) redirect("/events/new?error=title");

  const startsRaw = text(formData.get("starts_at"));
  const endsRaw = text(formData.get("ends_at"));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .insert({
      title,
      url: cleanUrl(text(formData.get("url"))),
      location: text(formData.get("location")),
      description: text(formData.get("description")),
      starts_at: startsRaw ? berlinLocalToISO(startsRaw) : null,
      ends_at: endsRaw ? berlinEndOfDayISO(endsRaw) : null,
      source: "user",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) redirect("/events/new?error=unknown");

  revalidatePath("/");
  redirect(`/events/${data.id}`);
}

export async function deleteEvent(formData: FormData) {
  const id = text(formData.get("id"));
  if (!id) redirect("/");
  const supabase = await createClient();
  await supabase.from("events").delete().eq("id", id);
  revalidatePath("/");
  redirect("/");
}
