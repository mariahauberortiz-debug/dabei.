import Link from "next/link";
import styles from "../../auth.module.css";
import TopBar from "@/components/TopBar";
import Field from "@/components/Field";
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

      <form action={createEvent} className={styles.form}>
        <Field id="url" label={t.newEvent.link} hint={t.newEvent.linkHint} type="text" inputMode="url" autoComplete="off" />
        <Field id="title" label={t.newEvent.name} placeholder={t.newEvent.namePlaceholder} required />
        <Field id="starts_at" label={t.newEvent.startsAt} type="datetime-local" />
        <Field id="ends_at" label={t.newEvent.endsAt} hint={t.newEvent.endsAtHint} type="date" />
        <Field id="location" label={t.newEvent.location} />
        <Field id="description" label={t.newEvent.description} />
        <button type="submit" className="btn btn-primary btn-block">
          {t.newEvent.save}
        </button>
      </form>

      <Link href="/" className={`body ${styles.switch}`}>
        {t.newEvent.cancel}
      </Link>
    </main>
  );
}
