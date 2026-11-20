import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";

/** For screens that need an account: send guests to sign-in and back here afterwards. */
export async function requireUser(next: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}
