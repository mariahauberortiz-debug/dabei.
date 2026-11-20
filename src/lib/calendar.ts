import { berlinLocalToISO, TZ } from "@/lib/dates";

// Calendar entries for a plan: .ics (Apple, Outlook) and a Google Calendar link.
// The reminder lives in the person's own calendar (no email/push needed).

export const DEFAULT_DURATION_MIN = 120;

type CalEvent = {
  uid: string;
  title: string;
  start: Date;
  end: Date;
  location?: string | null;
  description?: string;
  url?: string;
  alarmAt?: Date; // absolute alarm time
};

const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

// RFC 5545 text escaping + line folding at 75 octets
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
function fold(line: string) {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let current = "";
  for (const ch of line) {
    if (new TextEncoder().encode(current + ch).length > (out.length ? 74 : 75)) {
      out.push(current);
      current = ch;
    } else current += ch;
  }
  out.push(current);
  return out.join("\r\n ");
}

export function buildIcs(events: CalEvent[]) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//dabei.//DE", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(e.start)}`,
      `DTEND:${icsDate(e.end)}`,
      `SUMMARY:${esc(e.title)}`,
    );
    if (e.location) lines.push(`LOCATION:${esc(e.location)}`);
    if (e.description) lines.push(`DESCRIPTION:${esc(e.description)}`);
    if (e.url) lines.push(`URL:${e.url}`);
    if (e.alarmAt) {
      lines.push(
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:${esc(e.title)}`,
        `TRIGGER;VALUE=DATE-TIME:${icsDate(e.alarmAt)}`,
        "END:VALARM",
      );
    }
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

/** Berlin calendar date (YYYY-MM-DD) of an instant, shifted by n days. */
function berlinDay(d: Date, shiftDays: number) {
  const day = new Intl.DateTimeFormat("sv-SE", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const [y, m, dd] = day.split("-").map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, dd + shiftDays));
  return shifted.toISOString().slice(0, 10);
}

/** Reminder the evening before (18:00 Berlin); if that is already past or after the start, 3 h before. */
export function eveningBefore(start: Date) {
  const alarm = new Date(berlinLocalToISO(`${berlinDay(start, -1)}T18:00`)!);
  if (alarm.getTime() <= Date.now() || alarm >= start) return new Date(start.getTime() - 3 * 3_600_000);
  return alarm;
}

/** 10:00 Berlin the morning after (for the initiator's "Wie war's?"). */
export function morningAfter(start: Date) {
  return new Date(berlinLocalToISO(`${berlinDay(start, 1)}T10:00`)!);
}

export function googleCalendarUrl(e: { title: string; start: Date; end: Date; location?: string | null; details?: string }) {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${icsDate(e.start)}/${icsDate(e.end)}`,
    ctz: TZ,
  });
  if (e.location) p.set("location", e.location);
  if (e.details) p.set("details", e.details);
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
