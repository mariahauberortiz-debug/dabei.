import Link from "next/link";
import styles from "../../../auth.module.css";
import TopBar from "@/components/TopBar";
import EventForm from "@/components/EventForm";
import { updateEvent } from "../../actions";
import { getDictionary } from "@/i18n/lang";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EVENT_COLUMNS, type EventRow } from "@/lib/events";

// Edit an own event (screen 3 form, pre-filled)
export default async function EditEventPage({ params, searchParams }: PageProps<"/events/[id]/edit">) {
  const { id } = await params;
  const { error } = await searchParams;
  const user = await requireUser(`/events/${id}/edit`);
  const { lang, t } = await getDictionary();

  const supabase = await createClient();
  const [{ data }, { data: me }] = await Promise.all([
    supabase.from("events").select(EVENT_COLUMNS).eq("id", id).maybeSingle(),
    supabase.from("profiles").select("is_admin").eq("id", user.id).single(),
  ]);
  const event = data as EventRow | null;
  const canEdit = !!event && (event.created_by === user.id || !!me?.is_admin);

  if (!event || !canEdit) {
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

  return (
    <main className={`column ${styles.page}`}>
      <TopBar lang={lang} toggleLabel={t.langToggle.label} />

      <div className={styles.head}>
        <h1 className="display-l">{t.newEvent.editTitle}</h1>
      </div>

      {error && (
        <p role="alert" className={`body ${styles.error}`}>
          {error === "title" ? t.newEvent.errorTitle : t.newEvent.errorUnknown}
        </p>
      )}

      <EventForm
        t={t}
        action={updateEvent}
        event={event}
        submitLabel={t.newEvent.saveChanges}
        className={styles.form}
        userId={user.id}
        isAdmin={!!me?.is_admin}
      />

      <Link href={`/events/${event.id}`} className={`body ${styles.switch}`}>
        {t.newEvent.cancel}
      </Link>
    </main>
  );
}
