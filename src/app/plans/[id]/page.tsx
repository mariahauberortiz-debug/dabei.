import Link from "next/link";
import styles from "../../plan.module.css";
import TopBar from "@/components/TopBar";
import Photo from "@/components/Photo";
import ShareButtons from "@/components/ShareButtons";
import { getDictionary } from "@/i18n/lang";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/dates";
import { inviteLink, siteUrl } from "@/lib/plans";
import { removeParticipant } from "../actions";

type PlanRow = {
  id: string;
  starts_at: string;
  capacity: number | null;
  note: string | null;
  status: string;
  invite_token: string;
  initiator_id: string;
  event: { id: string; title: string; location: string | null; image_url: string | null } | null;
};
type ParticipantRow = {
  user_id: string;
  status: "going" | "declined";
  joined_at: string;
  profile: { display_name: string } | null;
};

// W / B8 / C3 · the plan: who's in, share the link
export default async function PlanPage({ params, searchParams }: PageProps<"/plans/[id]">) {
  const { id } = await params;
  const { joined } = await searchParams;
  const user = await requireUser(`/plans/${id}`);
  const { lang, t } = await getDictionary();
  const supabase = await createClient();

  const [{ data: planData }, { data: partData }] = await Promise.all([
    supabase
      .from("plans")
      .select("id,starts_at,capacity,note,status,invite_token,initiator_id,event:events(id,title,location,image_url)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("plan_participants")
      .select("user_id,status,joined_at,profile:profiles!plan_participants_user_id_fkey(display_name)")
      .eq("plan_id", id)
      .order("joined_at"),
  ]);
  const plan = planData as unknown as PlanRow | null;
  const participants = (partData ?? []) as unknown as ParticipantRow[];

  if (!plan || !plan.event) {
    return (
      <main className={`column ${styles.page}`}>
        <TopBar lang={lang} toggleLabel={t.langToggle.label} />
        <p className="body">{t.plan.notFound}</p>
        <Link href="/" className="btn btn-secondary">
          {t.event.back}
        </Link>
      </main>
    );
  }

  const isInitiator = plan.initiator_id === user.id;
  const going = participants.filter((p) => p.status === "going");
  const declined = participants.filter((p) => p.status === "declined");
  const initiatorName = participants.find((p) => p.user_id === plan.initiator_id)?.profile?.display_name ?? "";
  const placesLeft = plan.capacity ? Math.max(0, plan.capacity - going.length) : null;
  const iAmGoing = going.some((p) => p.user_id === user.id);
  const date = formatDateTime(plan.starts_at, lang);

  const link = inviteLink(await siteUrl(), plan.invite_token, user.id);
  const message = t.plan.shareMessage(plan.event.title, date, link);

  return (
    <main className={`column ${styles.page}`}>
      <TopBar lang={lang} toggleLabel={t.langToggle.label} />

      <Link href="/" className={styles.back}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <path d="M14.8 5.2c-2.9 1.9-5.3 4.2-7 6.8 1.8 2.5 4.2 4.6 7.1 6.6" />
        </svg>
        {t.event.back}
      </Link>

      {joined === "1" ? (
        <section className={styles.hero}>
          <h1 className="display-l">{t.invite.youreIn}</h1>
          <p className={`body ${styles.heroBox}`}>{t.invite.youreInBody}</p>
        </section>
      ) : (
        <p className={`label ${styles.muted}`}>{isInitiator ? t.plan.yourPlans : t.plan.by(initiatorName)}</p>
      )}

      <Link href={`/events/${plan.event.id}`} className={styles.summary}>
        <Photo src={plan.event.image_url} alt={plan.event.title} className={styles.thumb} />
        <span className={styles.summaryText}>
          <span className="title">{plan.event.title}</span>
          <span className={`body ${styles.muted}`}>{[date, plan.event.location].filter(Boolean).join(" · ")}</span>
        </span>
      </Link>

      {plan.note && <p className={`body ${styles.notice}`}>{plan.note}</p>}

      <section className={styles.section} aria-labelledby="who">
        <h2 id="who" className={styles.sectionTitle}>
          {t.plan.whoIsIn} · {t.plan.goingCount(going.length)}
          {placesLeft !== null && ` · ${t.plan.placesLeft(placesLeft)}`}
        </h2>
        <ul className={styles.people}>
          {going.map((p) => {
            const name = p.profile?.display_name ?? "?";
            return (
              <li key={p.user_id} className={styles.person}>
                <span className={styles.initial} aria-hidden="true">
                  {name.charAt(0).toUpperCase()}
                </span>
                <span className={styles.personName}>
                  {name}
                  {p.user_id === user.id && ` (${t.plan.you})`}
                </span>
                {isInitiator && p.user_id !== user.id && (
                  <form action={removeParticipant}>
                    <input type="hidden" name="plan_id" value={plan.id} />
                    <input type="hidden" name="user_id" value={p.user_id} />
                    <button type="submit" className={styles.textButton}>
                      {t.plan.remove}
                    </button>
                  </form>
                )}
              </li>
            );
          })}
          {declined.map((p) => (
            <li key={p.user_id} className={`${styles.person} ${styles.personDeclined}`}>
              <span className={styles.initial} aria-hidden="true">
                {(p.profile?.display_name ?? "?").charAt(0).toUpperCase()}
              </span>
              <span className={styles.personName}>
                {p.profile?.display_name} · {t.plan.declined}
              </span>
            </li>
          ))}
        </ul>
        {isInitiator && going.length <= 1 && <p className={`body ${styles.muted}`}>{t.plan.nobodyYet}</p>}
      </section>

      {iAmGoing && (placesLeft === null || placesLeft > 0) && (
        <section className={styles.section} aria-labelledby="share">
          <h2 id="share" className="title">
            {t.plan.shareTitle}
          </h2>
          <ShareButtons
            link={link}
            message={message}
            labels={{ whatsapp: t.plan.shareWhatsApp, copy: t.plan.copyLink, copied: t.plan.copied }}
          />
        </section>
      )}
    </main>
  );
}
