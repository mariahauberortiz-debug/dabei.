import LegalLinks from "@/components/LegalLinks";
import Link from "next/link";
import styles from "../auth.module.css";
import TopBar from "@/components/TopBar";
import Field from "@/components/Field";
import { signup } from "../auth/actions";
import { getDictionary } from "@/i18n/lang";
import { getInvite, isUuid } from "@/lib/plans";

type ErrorKey = "invalid" | "exists" | "weak" | "missing" | "unknown";

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { lang, t } = await getDictionary();
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/";
  const error = typeof params.error === "string" ? (params.error as ErrorKey) : null;
  const inviteToken = typeof params.invite === "string" ? params.invite : "";
  const from = isUuid(params.from) ? params.from : "";
  const invite = inviteToken ? await getInvite(inviteToken) : null;

  // Invite-only: without a valid invitation there is no sign-up form.
  if (!invite) {
    return (
      <main className={`column ${styles.page}`}>
        <TopBar lang={lang} toggleLabel={t.langToggle.label} />
        <div className={styles.head}>
          <h1 className="display-l">{t.inviteOnly.title}</h1>
          <p className={`body ${styles.muted}`}>{t.inviteOnly.body}</p>
        </div>
        <Link href="/login" className="btn btn-secondary btn-block">
          {t.home.login}
        </Link>
      </main>
    );
  }

  return (
    <main className={`column ${styles.page}`}>
      <TopBar lang={lang} toggleLabel={t.langToggle.label} />

      <div className={styles.head}>
        <p className={`label ${styles.muted}`}>
          {t.invite.from(invite.initiator)} · {invite.event.title}
        </p>
        <h1 className="display-l">{t.auth.signupTitle}</h1>
        <p className={`body ${styles.muted}`}>{t.auth.signupIntro}</p>
      </div>

      {error && (
        <p role="alert" className={`body ${styles.error}`}>
          {t.auth.errors[error] ?? t.auth.errors.unknown}
        </p>
      )}

      <form action={signup} className={styles.form}>
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="invite" value={inviteToken} />
        {from && <input type="hidden" name="from" value={from} />}
        <Field id="name" label={t.auth.name} hint={t.auth.nameHint} autoComplete="given-name" required />
        <Field id="email" label={t.auth.email} type="email" autoComplete="email" required />
        <Field
          id="password"
          label={t.auth.password}
          hint={t.auth.passwordHint}
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <button type="submit" className="btn btn-primary btn-block">
          {t.invite.join}
        </button>
      </form>

      <Link
        href={{ pathname: "/login", query: { next, invite: inviteToken, ...(from ? { from } : {}) } }}
        className={`body ${styles.switch}`}
      >
        {t.auth.toLogin}
      </Link>
      <LegalLinks />
    </main>
  );
}
