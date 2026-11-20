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
