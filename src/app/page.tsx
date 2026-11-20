import Link from "next/link";
import styles from "./page.module.css";
import TopBar from "@/components/TopBar";
import EventCard from "@/components/EventCard";
import { getDictionary } from "@/i18n/lang";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { EVENT_COLUMNS, groupForHome, type EventRow } from "@/lib/events";
import { logout } from "./auth/actions";

export default async function Home() {
  const { lang, t } = await getDictionary();
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className={`column ${styles.page}`}>
        <TopBar lang={lang} toggleLabel={t.langToggle.label} />
        <section className={styles.hero}>
          <h1 className="display-xl">{t.home.title}</h1>
          <p className={`body ${styles.muted}`}>{t.home.intro}</p>
        </section>
        <section className={styles.card}>
          <h2 className="title">{t.home.placeTitle}</h2>
          <p className="body">{t.home.placeBody}</p>
        </section>
        <div className={styles.actions}>
          <Link href="/signup" className="btn btn-primary btn-block">
            {t.home.signup}
          </Link>
          <Link href="/login" className="btn btn-secondary btn-block">
            {t.home.login}
          </Link>
        </div>
      </main>
    );
  }

  // Screen 4 · Homepage
  const supabase = await createClient();
  const [{ data: profile }, { data: events }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).single(),
    supabase.from("events").select(EVENT_COLUMNS).or(`source.eq.curated,created_by.eq.${user.id}`),
  ]);
  const groups = groupForHome((events ?? []) as EventRow[]);
  const hasOwn = groups.endingSoon.length + groups.soon.length + groups.someday.length > 0;

  const sections: { key: string; title: string; items: EventRow[]; endsIn?: boolean }[] = [
    { key: "ending", title: t.home.endingSoon, items: groups.endingSoon, endsIn: true },
    { key: "soon", title: t.home.soon, items: groups.soon },
    { key: "someday", title: t.home.someday, items: groups.someday },
    { key: "curated", title: t.home.curated, items: groups.curated },
  ];

  return (
    <main className={`column ${styles.page} ${styles.home}`}>
      <TopBar lang={lang} toggleLabel={t.langToggle.label} />

      <header className={styles.greeting}>
        <h1 className="display-l">
          {t.home.hello} {profile?.display_name ?? ""}
        </h1>
        <p className={`body ${styles.muted}`}>{t.home.tagline}</p>
      </header>

      {!hasOwn && (
        <div className={styles.card}>
          <p className="heading">{t.home.emptyTitle}</p>
          <p className="body">{t.home.emptyBody}</p>
          <Link href="/events/new" className="btn btn-primary">
            {t.home.addEvent}
          </Link>
        </div>
      )}

      {sections
        .filter((s) => s.items.length > 0)
        .map((s) => (
          <section key={s.key} className={styles.section} aria-labelledby={`h-${s.key}`}>
            <h2 id={`h-${s.key}`} className={styles.sectionTitle}>
              {s.title}
            </h2>
            {s.items.map((e) => (
              <EventCard key={e.id} event={e} lang={lang} t={t} showEndsIn={s.endsIn} />
            ))}
          </section>
        ))}

      <form action={logout} className={styles.logout}>
        <button type="submit" className={`body ${styles.textButton}`}>
          {t.home.logout}
        </button>
      </form>

      {hasOwn && (
        <Link href="/events/new" className={styles.fab} aria-label={t.home.addEvent}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M12.3 4.6c-.4 4.9-.3 9.9.1 14.8M4.7 12.4c4.9-.5 9.9-.4 14.7.1" />
          </svg>
        </Link>
      )}
    </main>
  );
}
