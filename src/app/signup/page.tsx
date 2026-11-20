import Link from "next/link";
import styles from "../auth.module.css";
import TopBar from "@/components/TopBar";
import Field from "@/components/Field";
import { signup } from "../auth/actions";
import { getDictionary } from "@/i18n/lang";

type ErrorKey = "invalid" | "exists" | "weak" | "missing" | "unknown";

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { lang, t } = await getDictionary();
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/";
  const error = typeof params.error === "string" ? (params.error as ErrorKey) : null;

  return (
    <main className={`column ${styles.page}`}>
      <TopBar lang={lang} toggleLabel={t.langToggle.label} />

      <div className={styles.head}>
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
          {t.auth.signupButton}
        </button>
      </form>

      <Link href={{ pathname: "/login", query: { next } }} className={`body ${styles.switch}`}>
        {t.auth.toLogin}
      </Link>
    </main>
  );
}
