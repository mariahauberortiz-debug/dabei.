"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/i18n/lang";

// Only allow redirects inside the app (e.g. back to an invitation).
function safeNext(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function withParams(path: string, params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  return `${path}?${qs}`;
}

export async function signup(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!name || !email || !password) redirect(withParams("/signup", { error: "missing", next }));
  if (password.length < 8) redirect(withParams("/signup", { error: "weak", next }));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: name, lang: await getLang() } },
  });

  if (error) {
    const code = error.code === "user_already_exists" ? "exists" : error.code === "weak_password" ? "weak" : "unknown";
    redirect(withParams("/signup", { error: code, next }));
  }

  // If email confirmation is switched on in Supabase there is no session yet.
  if (!data.session) redirect(withParams("/login", { checkEmail: "1", next }));

  revalidatePath("/", "layout");
  redirect(next);
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) redirect(withParams("/login", { error: "missing", next }));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(withParams("/login", { error: "invalid", next }));

  revalidatePath("/", "layout");
  redirect(next);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
