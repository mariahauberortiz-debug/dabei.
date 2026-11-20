import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "../../plan.module.css";
import TopBar from "@/components/TopBar";
import Photo from "@/components/Photo";
import Avatar from "@/components/Avatar";
import { getDictionary } from "@/i18n/lang";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/dates";
import { getInvite, isUuid } from "@/lib/plans";
import { declinePlan, joinPlan } from "@/app/plans/actions";

// C1 · Einladung im Browser (readable without an account, only with the link)
export default async function InvitePage({ params, searchParams }: PageProps<"/i/[token]">) {
  const { token } = await params;
  const sp = await searchParams;
  const from = isUuid(sp.from) ? sp.from : null;
  const result = typeof sp.result === "string" ? sp.result : null;
  const { lang, t } = await getDictionary();
  const [invite, user] = await Promise.all([getInvite(token), getCurrentUser()]);

  if (!invite) {
    return (
      <main className={`column ${styles.page}`}>
        <TopBar lang={lang} toggleLabel={t.langToggle.label} />
        <p className={`body ${styles.notice}`}>{t.invite.notFound}</p>
      </main>
    );
  }

  const placesLeft = invite.capacity ? Math.max(0, invite.capacity - invite.going_count) : null;
  const full = placesLeft === 0;
  const closed = invite.status !== "open";
  const date = formatDateTime(invite.starts_at, lang);
  const back = `/i/${token}${from ? `?from=${from}` : ""}`;
  const authQuery = { invite: token, ...(from ? { from } : {}), next: back };

  // Already in (or it's your own plan) → straight to the plan
  if (user && result === null) {
    const supabase = await createClient();
    const { data: me } = await supabase
      .from("plan_participants")
      .select("status")
      .eq("plan_id", invite.plan_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (me?.status === "going") redirect(`/plans/${invite.plan_id}`);
  }

  return (
    <main className={`column ${styles.page}`}>
      <TopBar lang={lang} toggleLabel={t.langToggle.label} loginLabel={user ? undefined : t.home.login} />

      <p className={`label ${styles.muted}`}>{t.invite.from(invite.initiator)}</p>

      <Photo src={invite.event.image_url} alt={invite.event.title} className={styles.photo} />

      <div className={styles.head}>
        <h1 className="display-l">{invite.event.title}</h1>
        <p className="heading">{[date, invite.event.location].filter(Boolean).join(" · ")}</p>
        {invite.event.description && <p className={`body ${styles.muted}`}>{invite.event.description}</p>}
      </div>

      {invite.note && <p className={`body ${styles.notice}`}>{invite.note}</p>}

      <section className={styles.section} aria-labelledby="who">
        <h2 id="who" className={styles.sectionTitle}>
          {t.plan.whoIsIn} · {t.plan.goingCount(invite.going_count)}
          {placesLeft !== null && ` · ${t.plan.placesLeft(placesLeft)}`}
        </h2>
        <ul className={styles.people}>
          {(invite.going_people ?? invite.going.map((name) => ({ name, avatar_url: null }))).map((person, i) => (
            <li key={`${person.name}-${i}`} className={styles.person}>
              <Avatar name={person.name} url={person.avatar_url} />
              <span className={styles.personName}>{person.name}</span>
            </li>
          ))}
        </ul>
      </section>

      {result === "declined" ? (
        <section className={styles.notice}>
          <p className="heading">{t.invite.declinedTitle}</p>
          <p className="body">{t.invite.declinedBody}</p>
        </section>
      ) : closed ? (
        <p className={`body ${styles.notice}`}>{t.invite.closed}</p>
      ) : full || result === "full" ? (
        <p className={`body ${styles.notice}`}>{t.invite.full}</p>
      ) : null}

      {!closed && !full && (
        <div className={styles.actions}>
          {user ? (
            <form action={joinPlan}>
              <input type="hidden" name="token" value={token} />
              {from && <input type="hidden" name="from" value={from} />}
              <button type="submit" className="btn btn-primary btn-block">
                {result === "declined" ? t.invite.changedMind : t.invite.join}
              </button>
            </form>
          ) : (
            <>
              <p className={`body ${styles.muted}`}>{t.invite.signupToJoin}</p>
              <Link href={{ pathname: "/signup", query: authQuery }} className="btn btn-primary btn-block">
                {t.invite.join}
              </Link>
              <Link href={{ pathname: "/login", query: authQuery }} className="btn btn-secondary btn-block">
                {t.invite.haveAccount}
              </Link>
            </>
          )}
          {result !== "declined" && (
            <form action={declinePlan}>
              <input type="hidden" name="token" value={token} />
              {from && <input type="hidden" name="from" value={from} />}
              <button type="submit" className={`body ${styles.textButton}`} style={{ fontSize: 15, width: "100%" }}>
                {t.invite.decline}
              </button>
            </form>
          )}
        </div>
      )}
    </main>
  );
}
