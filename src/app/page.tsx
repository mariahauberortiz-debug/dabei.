import Link from "next/link";
import styles from "./page.module.css";
import TopBar from "@/components/TopBar";
import { getDictionary } from "@/i18n/lang";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { logout } from "./auth/actions";

export default async function Home() {
  const { lang, t } = await getDictionary();
  const user = await getCurrentUser();

  if (user) {
    const supabase = await createClient();
    const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();

    return (
      <main className={`column ${styles.page}`}>
        <TopBar lang={lang} toggleLabel={t.langToggle.label} />
        <section className={styles.hero}>
          <h1 className="display-l">
            {t.home.hello} {profile?.display_name ?? ""}
          </h1>
          <p className={`body ${styles.muted}`}>{t.home.signedInBody}</p>
        </section>
        <form action={logout}>
          <button type="submit" className="btn btn-secondary">
            {t.home.logout}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className={`column ${styles.page}`}>
      <TopBar lang={lang} toggleLabel={t.langToggle.label} />

      <section className={styles.hero}>
        <h1 className="display-xl">{t.home.title}</h1>
        <p className={`body ${styles.muted}`}>{t.home.intro}</p>
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
