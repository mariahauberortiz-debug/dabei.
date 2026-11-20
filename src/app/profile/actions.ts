"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { ALL_INTEREST_KEYS } from "@/lib/interests";

export async function saveProfile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");

  const name = String(formData.get("name") ?? "").trim();
  const interests = formData
    .getAll("interests")
    .map(String)
    .filter((k) => ALL_INTEREST_KEYS.has(k));

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ ...(name ? { display_name: name } : {}), interests })
    .eq("id", user.id);

  revalidatePath("/", "layout");
  redirect("/profile?saved=1");
}
