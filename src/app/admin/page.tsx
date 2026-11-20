import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import styles from "../plan.module.css";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { getDictionary } from "@/i18n/lang";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, hoursAgoISO } from "@/lib/dates";
import { isUuid } from "@/lib/plans";

type Metrics = Record<string, number>;

// Wizard of Oz: Haubi logs that she nudged a plan by hand (so we can separate her effect from the app's)
async function markNudged(formData: FormData) {
  "use server";
  const id = formData.get("plan_id");
  if (!isUuid(id)) return;
  const supabase = await createClient();
  await supabase.from("plans").update({ manual_nudge_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin");
}

const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)} %` : "–");

// Pilot numbers (admin only)
export default async function AdminPage() {
  const user = await requireUser("/admin");
  const { lang, t } = await getDictionary();
  const supabase = await createClient();
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) redirect("/");

  const [{ data: m }, { data: open }] = await Promise.all([
    supabase.rpc("pilot_metrics"),
    supabase
      .from("plans")
      .select("id,starts_at,manual_nudge_at,event:events(title),plan_participants(attended)")
      .lt("starts_at", hoursAgoISO(2))
      .gt("starts_at", hoursAgoISO(24 * 14))
      .order("starts_at", { ascending: false }),
  ]);
  const x = (m ?? {}) as Metrics;
  const unanswered = ((open ?? []) as unknown as {
    id: string;
    starts_at: string;
    manual_nudge_at: string | null;
    event: { title: string } | null;
    plan_participants: { attended: boolean | null }[];
  }[]).filter((p) => p.plan_participants.every((pp) => pp.attended === null));

  const rows: [string, string][] = [
    [t.admin.answered, `${x.plans_answered ?? 0} / ${x.plans_past ?? 0} · ${pct(x.plans_answered, x.plans_past)}`],
    [t.admin.calendar, `${x.invitees_with_calendar_went ?? 0} / ${x.invitees_with_calendar ?? 0} · ${pct(x.invitees_with_calendar_went, x.invitees_with_calendar)}`],
    [t.admin.noCalendar, `${x.invitees_without_calendar_went ?? 0} / ${x.invitees_without_calendar ?? 0} · ${pct(x.invitees_without_calendar_went, x.invitees_without_calendar)}`],
    [t.admin.reminded, `${x.invitees_reminded_went ?? 0} / ${x.invitees_reminded ?? 0} · ${pct(x.invitees_reminded_went, x.invitees_reminded)}`],
    [t.admin.notReminded, `${x.invitees_not_reminded_went ?? 0} / ${x.invitees_not_reminded ?? 0} · ${pct(x.invitees_not_reminded_went, x.invitees_not_reminded)}`],
    [t.admin.ownPlan, `${x.joiners_started_own_plan ?? 0} / ${x.joiners ?? 0} · ${pct(x.joiners_started_own_plan, x.joiners)}`],
    [t.admin.nudged, `${x.plans_nudged_manually ?? 0}`],
  ];
  const basics: [string, string][] = [
    [t.admin.users, `${x.users ?? 0}`],
    [t.admin.events, `${x.events_own ?? 0} / ${x.events_curated ?? 0}`],
    [t.admin.plans, `${x.plans_total ?? 0} / ${x.plans_past ?? 0}`],
  ];

  return (
    <main className={`column ${styles.page}`} style={{ paddingBottom: 120 }}>
      <TopBar lang={lang} toggleLabel={t.langToggle.label} />
      <div className={styles.head}>
        <h1 className="display-l">{t.admin.title}</h1>
        <p className={`body ${styles.muted}`}>{t.admin.intro}</p>
      </div>

      <section className={styles.hero}>
        <p className="label">{t.admin.main}</p>
        <p className="display-xl">{pct(x.plans_invitee_went, x.plans_past_with_invitee)}</p>
        <p className={`body ${styles.heroBox}`}>
          {t.admin.mainLabel}: {x.plans_invitee_went ?? 0} / {x.plans_past_with_invitee ?? 0}
        </p>
      </section>

      <dl className={styles.people} style={{ margin: 0 }}>
        {rows.map(([k, v]) => (
          <div key={k} className={styles.person} style={{ justifyContent: "space-between" }}>
            <dt className="body">{k}</dt>
            <dd className="heading" style={{ margin: 0, whiteSpace: "nowrap" }}>{v}</dd>
          </div>
        ))}
      </dl>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t.admin.openPlans}</h2>
        {unanswered.length === 0 && <p className={`body ${styles.muted}`}>{t.admin.noData}</p>}
        {unanswered.map((p) => (
          <div key={p.id} className={styles.person} style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
            <Link href={`/plans/${p.id}`} className="body" style={{ color: "var(--ink)" }}>
              {p.event?.title} · {formatDateTime(p.starts_at, lang)}
            </Link>
            {p.manual_nudge_at ? (
              <span className={`caption ${styles.muted}`}>{t.admin.nudgedAt} ✓</span>
            ) : (
              <form action={markNudged}>
                <input type="hidden" name="plan_id" value={p.id} />
                <button type="submit" className={styles.textButton}>
                  {t.admin.markNudged}
                </button>
              </form>
            )}
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t.admin.basics}</h2>
        <dl className={styles.people} style={{ margin: 0 }}>
          {basics.map(([k, v]) => (
            <div key={k} className={styles.person} style={{ justifyContent: "space-between" }}>
              <dt className="body">{k}</dt>
              <dd className="heading" style={{ margin: 0 }}>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <BottomNav t={t} active="profile" />
    </main>
  );
}
