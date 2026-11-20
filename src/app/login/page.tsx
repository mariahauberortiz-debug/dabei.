import Link from "next/link";
import styles from "../auth.module.css";
import TopBar from "@/components/TopBar";
import Field from "@/components/Field";
import { login } from "../auth/actions";
import { getDictionary } from "@/i18n/lang";

type ErrorKey = "invalid" | "exists" | "weak" | "missing" | "unknown";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { lang, t } = await getDictionary();
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/";
  const error = typeof params.error === "string" ? (params.error as ErrorKey) : null;
  const checkEmail = params.checkEmail === "1";

  return (
    <main className={`column ${styles.page}`}>
      <TopBar lang={lang} toggleLabel={t.langToggle.label} />

      <div className={styles.head}>
        <h1 className="display-l">{t.auth.loginTitle}</h1>
      </div>

      {checkEmail && <p className={`body ${styles.notice}`}>{t.auth.checkEmail}</p>}
      {error && (
        <p role="alert" className={`body ${styles.error}`}>
          {t.auth.errors[error] ?? t.auth.errors.unknown}
        </p>
      )}

      <form action={login} className={styles.form}>
        <input type="hidden" name="next" value={next} />
        <Field id="email" label={t.auth.email} type="email" autoComplete="email" required />
        <Field id="password" label={t.auth.password} type="password" autoComplete="current-password" required />
        <button type="submit" className="btn btn-primary btn-block">
          {t.auth.loginButton}
        </button>
      </form>

      <Link href={{ pathname: "/signup", query: { next } }} className={`body ${styles.switch}`}>
        {t.auth.toSignup}
      </Link>
    </main>
  );
}
