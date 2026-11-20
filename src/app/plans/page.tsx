import Link from "next/link";
import styles from "../page.module.css";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { getDictionary } from "@/i18n/lang";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, hoursAgoISO } from "@/lib/dates";

type Row = {
  id: string;
  starts_at: string;
  event: { title: string; location: string | null } | null;
  plan_participants: { attended: boolean | null }[];
};

// Pläne: all my plans, upcoming and past (with the "Wie war's?" answer)
export default async function PlansPage() {
  const user = await requireUser("/plans");
  const { lang, t } = await getDictionary();
  const supabase = await createClient();
  const { data } = await supabase
    .from("plans")
    .select("id,starts_at,event:events(title,location),plan_participants!inner(user_id,status,attended)")
    .eq("plan_participants.user_id", user.id)
    .eq("plan_participants.status", "going")
    .order("starts_at");
  const rows = (data ?? []) as unknown as Row[];
  const cutoff = new Date(hoursAgoISO(2)).getTime();
  const upcoming = rows.filter((r) => new Date(r.starts_at).getTime() > cutoff);
  const past = rows.filter((r) => new Date(r.starts_at).getTime() <= cutoff).reverse();

  return (
    <main className={`column ${styles.page} ${styles.home}`}>
      <TopBar lang={lang} toggleLabel={t.langToggle.label} />
      <h1 className="display-l">{t.plansPage.title}</h1>

      {rows.length === 0 && (
        <div className={styles.card}>
          <p className="body">{t.plansPage.empty}</p>
          <Link href="/" className="btn btn-primary">
            {t.plansPage.toList}
          </Link>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className={styles.section} aria-labelledby="h-up">
          <h2 id="h-up" className={styles.sectionTitle}>
            {t.plansPage.upcoming}
          </h2>
          {upcoming.map((p) => (
            <Link key={p.id} href={`/plans/${p.id}`} className={styles.planCard}>
              <span className={styles.planText}>
                <span className="title">{p.event?.title}</span>
                <span className="body">{[formatDateTime(p.starts_at, lang), p.event?.location].filter(Boolean).join(" · ")}</span>
              </span>
              <span aria-hidden="true" className={styles.planDots}>
                ..
              </span>
            </Link>
          ))}
        </section>
      )}

      {past.length > 0 && (
        <section className={styles.section} aria-labelledby="h-past">
          <h2 id="h-past" className={styles.sectionTitle}>
            {t.plansPage.past}
          </h2>
          {past.map((p) => {
            const attended = p.plan_participants[0]?.attended;
            const status = attended === true ? t.plansPage.went : attended === false ? t.plansPage.notWent : t.plansPage.open;
            return (
              <Link key={p.id} href={attended === null || attended === undefined ? `/plans/${p.id}/review` : `/plans/${p.id}`} className={styles.pastCard}>
                <span className="heading">{p.event?.title}</span>
                <span className={`caption ${styles.muted}`}>
                  {formatDateTime(p.starts_at, lang)} · {status}
                </span>
              </Link>
            );
          })}
        </section>
      )}

      <BottomNav t={t} active="plans" />
    </main>
  );
}
