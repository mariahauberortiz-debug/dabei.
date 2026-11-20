import Link from "next/link";
import styles from "../../../plan.module.css";
import TopBar from "@/components/TopBar";
import Field from "@/components/Field";
import Photo from "@/components/Photo";
import { getDictionary } from "@/i18n/lang";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EVENT_COLUMNS, type EventRow } from "@/lib/events";
import { TZ } from "@/lib/dates";
import { createPlan } from "@/app/plans/actions";

/** ISO → "2026-11-28T19:30" in Berlin time, for <input type="datetime-local"> */
function toBerlinInput(iso: string) {
  const p = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
  return p.replace(" ", "T");
}

// B6 · Termin festlegen (fixed date, set by the initiator) → then share
export default async function NewPlanPage({ params, searchParams }: PageProps<"/events/[id]/plan">) {
  const { id } = await params;
  const { error } = await searchParams;
  await requireUser(`/events/${id}/plan`);
  const { lang, t } = await getDictionary();

  const supabase = await createClient();
  const { data } = await supabase.from("events").select(EVENT_COLUMNS).eq("id", id).maybeSingle();
  const event = data as EventRow | null;

  if (!event) {
    return (
      <main className={`column ${styles.page}`}>
        <TopBar lang={lang} toggleLabel={t.langToggle.label} />
        <p className="body">{t.event.notFound}</p>
      </main>
    );
  }

  const defaultDate = event.starts_at && new Date(event.starts_at) > new Date() ? toBerlinInput(event.starts_at) : undefined;

  return (
    <main className={`column ${styles.page}`}>
      <TopBar lang={lang} toggleLabel={t.langToggle.label} />

      <Link href={`/events/${event.id}`} className={styles.back}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <path d="M14.8 5.2c-2.9 1.9-5.3 4.2-7 6.8 1.8 2.5 4.2 4.6 7.1 6.6" />
        </svg>
        {t.event.back}
      </Link>

      <div className={styles.summary}>
        <Photo src={event.image_url} alt={event.title} className={styles.thumb} />
        <span className={styles.summaryText}>
          <span className="title">{event.title}</span>
          {event.location && <span className={`caption ${styles.muted}`}>{event.location}</span>}
        </span>
      </div>

      <div className={styles.head}>
        <h1 className="display-l">{t.plan.newTitle}</h1>
        <p className={`body ${styles.muted}`}>{t.plan.newIntro}</p>
      </div>

      {error && (
        <p role="alert" className={`body ${styles.error}`}>
          {error === "date" ? t.plan.errorDate : t.plan.errorUnknown}
        </p>
      )}

      <form action={createPlan} className={styles.form}>
        <input type="hidden" name="event_id" value={event.id} />
        <Field id="starts_at" label={t.plan.date} type="datetime-local" defaultValue={defaultDate} required />
        <Field id="capacity" label={t.plan.capacity} hint={t.plan.capacityHint} type="number" inputMode="numeric" min={2} max={50} />
        <Field id="note" label={t.plan.note} placeholder={t.plan.notePlaceholder} />
        <button type="submit" className="btn btn-primary btn-block">
          {t.plan.create}
        </button>
      </form>
    </main>
  );
}
