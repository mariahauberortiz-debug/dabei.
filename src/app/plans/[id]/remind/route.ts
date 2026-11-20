import { NextResponse, type NextRequest } from "next/server";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n/lang";
import { isUuid, siteUrl } from "@/lib/plans";
import { formatTime, relativeDay } from "@/lib/dates";

// GET /plans/:id/remind?user=<id>
// Dev 7: the initiator reminds one person. We record it (for the metric) and open WhatsApp with the message ready.
export async function GET(request: NextRequest, ctx: RouteContext<"/plans/[id]/remind">) {
  const { id } = await ctx.params;
  const target = request.nextUrl.searchParams.get("user");
  const back = NextResponse.redirect(new URL(`/plans/${id}`, request.url));
  if (!isUuid(target)) return back;

  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL(`/login?next=/plans/${id}`, request.url));

  const supabase = await createClient();
  const { data } = await supabase
    .from("plans")
    .select("id,starts_at,initiator_id,event:events(title)")
    .eq("id", id)
    .maybeSingle();
  const plan = data as unknown as { id: string; starts_at: string; initiator_id: string; event: { title: string } | null } | null;
  if (!plan?.event || plan.initiator_id !== user.id) return back;

  await supabase.from("plan_participants").update({ reminded_at: new Date().toISOString() }).eq("plan_id", id).eq("user_id", target);

  const { lang, t } = await getDictionary();
  const time = formatTime(plan.starts_at, lang);
  const when = relativeDay(plan.starts_at) === "today" ? t.reminder.whenToday(time) : t.reminder.whenTomorrow(time);
  const message = t.reminder.message(plan.event.title, when, `${await siteUrl()}/plans/${id}`);
  return NextResponse.redirect(`https://wa.me/?text=${encodeURIComponent(message)}`);
}
