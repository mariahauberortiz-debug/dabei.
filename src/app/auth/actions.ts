"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/i18n/lang";
import { getInvite } from "@/lib/plans";
import { joinWithToken } from "@/app/plans/actions";

// Only allow redirects inside the app (e.g. back to an invitation).
function safeNext(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

function withParams(path: string, params: Record<string, string>) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
  return `${path}?${new URLSearchParams(clean).toString()}`;
}

// dabei. is invite-only: an account can only be created from a valid invitation link.
export async function signup(formData: FormData) {
  const name = str(formData.get("name"));
  const email = str(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));
  const invite = str(formData.get("invite"));
  const from = str(formData.get("from"));
  const back = (error: string) => withParams("/signup", { error, next, invite, from });

  if (!invite || !(await getInvite(invite))) redirect("/signup");
  if (!name || !email || !password) redirect(back("missing"));
  if (password.length < 8) redirect(back("weak"));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: name, lang: await getLang() } },
  });

  if (error) {
    const code = error.code === "user_already_exists" ? "exists" : error.code === "weak_password" ? "weak" : "unknown";
    redirect(back(code));
  }
  if (!data.session) redirect(withParams("/login", { checkEmail: "1", next, invite, from }));

  revalidatePath("/", "layout");
  // Signing up from an invitation means "Ich bin dabei": join right away (C2 → C3).
  await joinWithToken(invite, from || null);
}

export async function login(formData: FormData) {
  const email = str(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));
  const invite = str(formData.get("invite"));
  const from = str(formData.get("from"));

  if (!email || !password) redirect(withParams("/login", { error: "missing", next, invite, from }));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(withParams("/login", { error: "invalid", next, invite, from }));

  revalidatePath("/", "layout");
  if (invite) await joinWithToken(invite, from || null);
  redirect(next);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

// Landing: someone pastes the invitation link they got → take them to the invitation page.
export async function openInvite(formData: FormData) {
  const raw = str(formData.get("invite_link"));
  const token = raw.match(/\/i\/([a-f0-9]{8,64})/)?.[1] ?? raw.match(/^[a-f0-9]{8,64}$/)?.[0];
  if (!token || !(await getInvite(token))) redirect("/?invite=invalid");
  const from = raw.match(/[?&]from=([0-9a-f-]{36})/)?.[1];
  redirect(`/i/${token}${from ? `?from=${from}` : ""}`);
}
