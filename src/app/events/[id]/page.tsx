import Link from "next/link";
import styles from "./detail.module.css";
import TopBar from "@/components/TopBar";
import Photo from "@/components/Photo";
import { getDictionary } from "@/i18n/lang";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EVENT_COLUMNS, type EventRow } from "@/lib/events";
import { formatDate, formatRange, toBerlinParts } from "@/lib/dates";
import { headers } from "next/headers";
import { deleteEvent } from "../actions";

// Screen 5 · Event-Detail (own or curated)
export default async function EventDetailPage({ params }: PageProps<"/events/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/events/${id}`);
  const { lang, t } = await getDictionary();

  const supabase = await createClient();
  const { data } = await supabase.from("events").select(EVENT_COLUMNS).eq("id", id).maybeSingle();
  const event = data as EventRow | null;

  if (!event) {
    return (
      <main className={`column ${styles.page}`}>
        <TopBar lang={lang} toggleLabel={t.langToggle.label} />
        <p className="body">{t.event.notFound}</p>
        <Link href="/" className="btn btn-secondary">
          {t.event.back}
        </Link>
      </main>
    );
  }

  const curated = event.source === "curated";
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  const canEdit = event.created_by === user.id || !!me?.is_admin;

  // "runs until" = ends on another day than it starts (or has no start)
  const runsUntil =
    event.ends_at && (!event.starts_at || toBerlinParts(event.starts_at).date !== toBerlinParts(event.ends_at).date)
      ? event.ends_at
      : null;
  const ua = (await headers()).get("user-agent") ?? "";
  const mapsUrl = (q: string) =>
    /iPhone|iPad|Macintosh/.test(ua)
      ? `https://maps.apple.com/?q=${encodeURIComponent(q)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

  const facts: { k: string; v: React.ReactNode }[] = [];
  if (event.starts_at) facts.push({ k: t.event.when, v: formatRange(event.starts_at, runsUntil ? null : event.ends_at, lang) });
  if (runsUntil) facts.push({ k: t.event.whenUntil, v: formatDate(runsUntil, lang) });
  if (event.location)
    facts.push({
      k: t.event.where,
      v: (
        <>
          {event.location}
          <br />
          <a href={mapsUrl(event.location)} target="_blank" rel="noopener noreferrer">
            {t.event.openMap}
          </a>
        </>
      ),
    });
  if (event.url)
    facts.push({
      k: t.event.link,
      v: (
        <a href={event.url} target="_blank" rel="noopener noreferrer">
          {t.event.openLink}
        </a>
      ),
    });

  return (
    <main className={`column ${styles.page}`}>
      <TopBar lang={lang} toggleLabel={t.langToggle.label} />

      <Link href="/" className={styles.back}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <path d="M14.8 5.2c-2.9 1.9-5.3 4.2-7 6.8 1.8 2.5 4.2 4.6 7.1 6.6" />
        </svg>
        {t.event.back}
      </Link>

      <Photo src={event.image_url} alt={event.title} className={styles.photo} />

      <div className={styles.head}>
        <span className={curated ? `${styles.badge} ${styles.badgeCurated}` : styles.badge}>
          {curated ? t.event.badgeCurated : t.event.badgeOwn}
        </span>
        <h1 className="display-l">{event.title}</h1>
        {event.description && <p className="body" style={{ whiteSpace: "pre-line" }}>{event.description}</p>}
      </div>

      {facts.length > 0 && (
        <dl className={styles.facts}>
          {facts.map((f) => (
            <div key={f.k} className={styles.fact}>
              <dt>{f.k}</dt>
              <dd>{f.v}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className={styles.actions}>
        <Link href={`/events/${event.id}/plan`} className="btn btn-primary btn-block">
          {t.event.goWithSomeone}
        </Link>
        {canEdit && (
          <div className={styles.ownerActions}>
            <Link href={`/events/${event.id}/edit`} className="btn btn-secondary">
              {t.event.edit}
            </Link>
            <form action={deleteEvent}>
              <input type="hidden" name="id" value={event.id} />
              <button type="submit" className="btn btn-secondary">
                {t.event.delete}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
