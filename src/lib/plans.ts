import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type Invite = {
  plan_id: string;
  starts_at: string;
  capacity: number | null;
  note: string | null;
  status: "open" | "cancelled";
  event: { title: string; description: string | null; location: string | null; url: string | null; image_url: string | null };
  initiator: string;
  going: string[];
  going_people?: { name: string; avatar_url: string | null }[];
  going_count: number;
};

/** Invitation data by link token – works without an account (only with the link). */
export async function getInvite(token: string): Promise<Invite | null> {
  if (!/^[a-f0-9]{8,64}$/.test(token)) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_invite", { p_token: token });
  return (data as Invite | null) ?? null;
}

/** Absolute base URL of the app for the current request (for share links). */
export async function siteUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "bistdudabei.vercel.app";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Invitation link; `from` records who passed it on (chain invitations). */
export function inviteLink(base: string, token: string, from?: string) {
  return `${base}/i/${token}${from ? `?from=${from}` : ""}`;
}

export const isUuid = (v: unknown): v is string =>
  typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
