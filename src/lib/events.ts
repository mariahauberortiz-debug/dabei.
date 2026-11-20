export type EventRow = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  url: string | null;
  image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  source: "user" | "curated";
  category: string | null;
  created_by: string | null;
};

export const EVENT_COLUMNS = "id,title,description,location,url,image_url,starts_at,ends_at,source,created_by,category";

/**
 * Homepage grouping (screen 4):
 * - endingSoon: things that run until a date within the next 14 days (exhibitions …)
 * - soon: things with an upcoming start date
 * - someday: own saved things without a date
 * - curated: Haubi's picks
 * Past events are left out.
 */
export function groupForHome(events: EventRow[]) {
  const now = Date.now();
  const in14d = now + 14 * 86_400_000;
  const isPast = (e: EventRow) => {
    const last = e.ends_at ?? e.starts_at;
    return last !== null && new Date(last).getTime() < now;
  };
  const byDate = (key: "starts_at" | "ends_at") => (a: EventRow, b: EventRow) =>
    new Date(a[key] ?? 0).getTime() - new Date(b[key] ?? 0).getTime();

  const upcoming = events.filter((e) => !isPast(e));
  const own = upcoming.filter((e) => e.source === "user");
  const curated = upcoming.filter((e) => e.source === "curated");

  // "Runs until" = has an end but no start, or ends more than 14 h after it starts (exhibitions, not evening events)
  const runsUntil = (e: EventRow) =>
    !!e.ends_at && (!e.starts_at || new Date(e.ends_at).getTime() - new Date(e.starts_at).getTime() > 14 * 3_600_000);
  const endingSoon = own
    .filter((e) => runsUntil(e) && new Date(e.ends_at!).getTime() <= in14d)
    .sort(byDate("ends_at"));
  const rest = own.filter((e) => !endingSoon.includes(e));
  const soon = rest.filter((e) => e.starts_at).sort(byDate("starts_at"));
  const someday = rest.filter((e) => !e.starts_at);

  return { endingSoon, soon, someday, curated: curated.sort(byDate("starts_at")) };
}
