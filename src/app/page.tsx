import Link from "next/link";
import styles from "./page.module.css";
import TopBar from "@/components/TopBar";
import EventCard from "@/components/EventCard";
import { getDictionary } from "@/i18n/lang";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { EVENT_COLUMNS, groupForHome, type EventRow } from "@/lib/events";
import { logout } from "./auth/actions";
import { formatDateTime, hoursAgoISO } from "@/lib/dates";

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
          <Link href="/login" className="btn btn-primary btn-block">
            {t.home.login}
          </Link>
          <p className={`caption ${styles.muted}`}>{t.inviteOnly.body}</p>
        </div>
      </main>
    );
  }

  // Screen 4 · Homepage
  const supabase = await createClient();
  const since = hoursAgoISO(12); // keep today's plans visible
  const [{ data: profile }, { data: events }, { data: planData }, { data: reviewData }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).single(),
    supabase.from("events").select(EVENT_COLUMNS).or(`source.eq.curated,created_by.eq.${user.id}`),
    supabase
      .from("plans")
      .select("id,starts_at,event:events(title,location),plan_participants!inner(user_id,status)")
      .eq("plan_participants.user_id", user.id)
      .eq("plan_participants.status", "going")
      .eq("status", "open")
      .gte("starts_at", since)
      .order("starts_at"),
    // Screen 11 entry: past plans (last 3 days) where I haven't said yet whether I was there
    supabase
      .from("plans")
      .select("id,event:events(title),plan_participants!inner(user_id,status,attended)")
      .eq("plan_participants.user_id", user.id)
      .eq("plan_participants.status", "going")
      .is("plan_participants.attended", null)
      .lte("starts_at", hoursAgoISO(2))
      .gte("starts_at", hoursAgoISO(72))
      .order("starts_at", { ascending: false })
      .limit(1),
  ]);
  const toReview = ((reviewData ?? []) as unknown as { id: string; event: { title: string } | null }[])[0];
  const plans = (planData ?? []) as unknown as {
    id: string;
    starts_at: string;
    event: { title: string; location: string | null } | null;
  }[];
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

      {toReview?.event && (
        <Link href={`/plans/${toReview.id}/review`} className={styles.reviewCard}>
          <span className="title">{t.review.prompt(toReview.event.title)}</span>
          <span className="btn btn-primary">{t.review.promptCta}</span>
        </Link>
      )}

      {plans.length > 0 && (
        <section className={styles.section} aria-labelledby="h-plans">
          <h2 id="h-plans" className={styles.sectionTitle}>
            {t.plan.yourPlans}
          </h2>
          {plans.map((p) => (
            <Link key={p.id} href={`/plans/${p.id}`} className={styles.planCard}>
              <span className={styles.planText}>
                <span className="title">{p.event?.title}</span>
                <span className="body">
                  {[formatDateTime(p.starts_at, lang), p.event?.location].filter(Boolean).join(" · ")}
                </span>
              </span>
              <span aria-hidden="true" className={styles.planDots}>
                ..
              </span>
            </Link>
          ))}
        </section>
      )}

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
