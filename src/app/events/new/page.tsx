import Link from "next/link";
import styles from "../../auth.module.css";
import TopBar from "@/components/TopBar";
import EventForm from "@/components/EventForm";
import { createEvent } from "../actions";
import { getDictionary } from "@/i18n/lang";
import { requireUser } from "@/lib/auth";

// Screen 3 · Eigene Events
export default async function NewEventPage({ searchParams }: PageProps<"/events/new">) {
  await requireUser("/events/new");
  const { lang, t } = await getDictionary();
  const { error } = await searchParams;

  return (
    <main className={`column ${styles.page}`}>
      <TopBar lang={lang} toggleLabel={t.langToggle.label} />

      <div className={styles.head}>
        <h1 className="display-l">{t.newEvent.title}</h1>
        <p className={`body ${styles.muted}`}>{t.newEvent.intro}</p>
      </div>

      {error && (
        <p role="alert" className={`body ${styles.error}`}>
          {error === "title" ? t.newEvent.errorTitle : t.newEvent.errorUnknown}
        </p>
      )}

      <EventForm t={t} action={createEvent} submitLabel={t.newEvent.save} className={styles.form} />

      <Link href="/" className={`body ${styles.switch}`}>
        {t.newEvent.cancel}
      </Link>
    </main>
  );
}
