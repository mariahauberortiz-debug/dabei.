import Link from "next/link";
import styles from "../../../plan.module.css";
import TopBar from "@/components/TopBar";
import Photo from "@/components/Photo";
import Field from "@/components/Field";
import { getDictionary } from "@/i18n/lang";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, isPast } from "@/lib/dates";
import { saveReview } from "../../review-actions";

type Row = { user_id: string; attended: boolean | null; profile: { display_name: string } | null };

// Screen 11 · Wie war's?
export default async function ReviewPage({ params, searchParams }: PageProps<"/plans/[id]/review">) {
  const { id } = await params;
  const { saved } = await searchParams;
  const user = await requireUser(`/plans/${id}/review`);
  const { lang, t } = await getDictionary();
  const supabase = await createClient();

  const [{ data: planData }, { data: rowData }] = await Promise.all([
    supabase
      .from("plans")
      .select("id,starts_at,initiator_id,review_note,event:events(title,location,image_url)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("plan_participants")
      .select("user_id,attended,profile:profiles!plan_participants_user_id_fkey(display_name)")
      .eq("plan_id", id)
      .eq("status", "going")
      .order("joined_at"),
  ]);
  const plan = planData as unknown as {
    id: string;
    starts_at: string;
    initiator_id: string;
    review_note: string | null;
    event: { title: string; location: string | null; image_url: string | null } | null;
  } | null;
  const rows = (rowData ?? []) as unknown as Row[];

  if (!plan?.event || !rows.some((r) => r.user_id === user.id)) {
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

  const header = (
    <>
      <TopBar lang={lang} toggleLabel={t.langToggle.label} />
      <div className={styles.summary}>
        <Photo src={plan.event.image_url} alt={plan.event.title} className={styles.thumb} />
        <span className={styles.summaryText}>
          <span className="title">{plan.event.title}</span>
          <span className={`body ${styles.muted}`}>
            {[formatDateTime(plan.starts_at, lang), plan.event.location].filter(Boolean).join(" · ")}
          </span>
        </span>
      </div>
    </>
  );

  if (saved === "went" || saved === "not") {
    return (
      <main className={`column ${styles.page}`}>
        {header}
        <section className={saved === "went" ? styles.hero : styles.notice}>
          <h1 className="display-l">{t.review.thanksTitle}</h1>
          <p className={`body ${saved === "went" ? styles.heroBox : ""}`}>
            {saved === "went" ? t.review.thanksWent : t.review.thanksNot}
          </p>
        </section>
        <Link href="/" className="btn btn-primary btn-block">
          {t.event.back}
        </Link>
      </main>
    );
  }

  if (!isPast(plan.starts_at)) {
    return (
      <main className={`column ${styles.page}`}>
        {header}
        <p className={`body ${styles.notice}`}>{t.review.tooEarly}</p>
        <Link href={`/plans/${plan.id}`} className="btn btn-secondary">
          {t.event.back}
        </Link>
      </main>
    );
  }

  const isInitiator = plan.initiator_id === user.id;
  const visible = isInitiator ? rows : rows.filter((r) => r.user_id === user.id);

  return (
    <main className={`column ${styles.page}`}>
      {header}

      <div className={styles.head}>
        <h1 className="display-l">{t.review.title}</h1>
        <p className={`body ${styles.muted}`}>{isInitiator ? t.review.intro : t.review.selfIntro}</p>
      </div>

      <form action={saveReview} className={styles.form}>
        <input type="hidden" name="plan_id" value={plan.id} />
        {visible.map((r) => {
          const name = r.user_id === user.id ? `${r.profile?.display_name ?? ""} (${t.plan.you})` : r.profile?.display_name ?? "?";
          return (
            <fieldset key={r.user_id} className={styles.choice}>
              <legend className={styles.choiceName}>
                <span className={styles.initial} aria-hidden="true">
                  {(r.profile?.display_name ?? "?").charAt(0).toUpperCase()}
                </span>
                {name}
              </legend>
              <div className={styles.choiceOptions}>
                <label className={styles.option}>
                  <input type="radio" name={`attended_${r.user_id}`} value="yes" defaultChecked={r.attended === true} required />
                  <span>{isInitiator ? t.review.was : t.review.yes}</span>
                </label>
                <label className={styles.option}>
                  <input type="radio" name={`attended_${r.user_id}`} value="no" defaultChecked={r.attended === false} />
                  <span>{isInitiator ? t.review.wasNot : t.review.no}</span>
                </label>
              </div>
            </fieldset>
          );
        })}
        {isInitiator && (
          <Field id="note" label={t.review.note} placeholder={t.review.notePlaceholder} defaultValue={plan.review_note ?? undefined} />
        )}
        <button type="submit" className="btn btn-primary btn-block">
          {t.review.save}
        </button>
      </form>
    </main>
  );
}
