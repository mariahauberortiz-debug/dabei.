import { NextResponse, type NextRequest } from "next/server";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n/lang";
import { siteUrl } from "@/lib/plans";
import { buildIcs, DEFAULT_DURATION_MIN, eveningBefore, googleCalendarUrl, morningAfter } from "@/lib/calendar";

// GET /plans/:id/calendar?type=ics|google
// Adds the plan to the person's calendar (reminder the evening before) and records that they did.
export async function GET(request: NextRequest, ctx: RouteContext<"/plans/[id]/calendar">) {
  const { id } = await ctx.params;
  const type = request.nextUrl.searchParams.get("type") === "google" ? "google" : "ics";

  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL(`/login?next=/plans/${id}`, request.url));

  const supabase = await createClient();
  const { data } = await supabase
    .from("plans")
    .select("id,starts_at,initiator_id,event:events(title,location)")
    .eq("id", id)
    .maybeSingle();
  const plan = data as unknown as {
    id: string;
    starts_at: string;
    initiator_id: string;
    event: { title: string; location: string | null } | null;
  } | null;
  if (!plan?.event) return NextResponse.redirect(new URL(`/plans/${id}`, request.url));

  // Measure: who added the plan to their calendar (first time only)
  await supabase
    .from("plan_participants")
    .update({ added_to_calendar_at: new Date().toISOString() })
    .eq("plan_id", id)
    .eq("user_id", user.id)
    .is("added_to_calendar_at", null);

  const { t } = await getDictionary();
  const base = await siteUrl();
  const planUrl = `${base}/plans/${id}`;
  const reviewUrl = `${base}/plans/${id}/review`;
  const start = new Date(plan.starts_at);
  const end = new Date(start.getTime() + DEFAULT_DURATION_MIN * 60_000);
  const title = `${plan.event.title} · dabei.`;
  const description = t.calendar.eventDescription(planUrl);

  if (type === "google") {
    return NextResponse.redirect(googleCalendarUrl({ title, start, end, location: plan.event.location, details: description }));
  }

  const events = [
    { uid: `plan-${id}@dabei`, title, start, end, location: plan.event.location, description, url: planUrl, alarmAt: eveningBefore(start) },
  ];
  // The initiator also gets a small "Wie war's?" entry the morning after (that's how we ask without email/push).
  if (plan.initiator_id === user.id) {
    const reviewStart = morningAfter(start);
    events.push({
      uid: `review-${id}@dabei`,
      title: t.calendar.reviewTitle,
      start: reviewStart,
      end: new Date(reviewStart.getTime() + 15 * 60_000),
      location: null,
      description: t.calendar.reviewDescription(plan.event.title, reviewUrl),
      url: reviewUrl,
      alarmAt: reviewStart,
    });
  }

  return new NextResponse(buildIcs(events), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="dabei-plan.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
