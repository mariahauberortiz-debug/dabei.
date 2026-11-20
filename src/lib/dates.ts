import type { Lang } from "@/i18n/dictionaries";

// The app is for Berlin: all times are shown and entered in Berlin time,
// whatever timezone the server runs in.
export const TZ = "Europe/Berlin";

const locale = (lang: Lang) => (lang === "de" ? "de-DE" : "en-GB");

/** Offset of Berlin from UTC (in ms) at a given instant. */
function berlinOffsetMs(utcMs: number) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - utcMs;
}

/** "2026-11-28T19:30" (Berlin wall time, from <input type="datetime-local">) → ISO string in UTC. */
export function berlinLocalToISO(value: string): string | null {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/);
  if (!m) return null;
  const [, y, mo, d, h = "00", mi = "00"] = m;
  const guess = Date.UTC(+y, +mo - 1, +d, +h, +mi);
  const off1 = berlinOffsetMs(guess);
  let utc = guess - off1;
  const off2 = berlinOffsetMs(utc); // differs only around daylight-saving switches
  if (off2 !== off1) utc = guess - off2;
  return new Date(utc).toISOString();
}

/** End of a Berlin calendar day ("2026-11-24" → 23:59 that day) as ISO. */
export function berlinEndOfDayISO(value: string): string | null {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? berlinLocalToISO(`${value}T23:59`) : null;
}

/** "Fr 22.11., 20:00" / "Fri 22 Nov, 20:00" */
export function formatDateTime(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(locale(lang), {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: lang === "de" ? "numeric" : "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** "So 24.11." / "Sun 24 Nov" */
export function formatDate(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(locale(lang), {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: lang === "de" ? "numeric" : "short",
  }).format(new Date(iso));
}

/** Whole days from now until the instant (0 = today). */
export function daysUntil(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/** ISO timestamp for "n hours ago" (used to keep today's plans visible). */
export function hoursAgoISO(n: number) {
  return new Date(Date.now() - n * 3_600_000).toISOString();
}

export function isPast(iso: string) {
  return new Date(iso).getTime() <= Date.now();
}

/** ISO → { date: "2026-11-28", time: "19:30" } in Berlin time (for form defaults). */
export function toBerlinParts(iso: string) {
  const s = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
  const [date, time] = s.split(" ");
  return { date, time };
}

/** "20:00" */
export function formatTime(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "de" ? "de-DE" : "en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso),
  );
}

/** Start, plus end time when it ends the same day: "Fr 22.11., 20:00–23:00" */
export function formatRange(startIso: string, endIso: string | null, lang: Lang) {
  const start = formatDateTime(startIso, lang);
  if (!endIso) return start;
  const sameDay = toBerlinParts(startIso).date === toBerlinParts(endIso).date;
  const shortGap = new Date(endIso).getTime() - new Date(startIso).getTime() <= 14 * 3_600_000;
  return sameDay || shortGap ? `${start}–${formatTime(endIso, lang)}` : start;
}
