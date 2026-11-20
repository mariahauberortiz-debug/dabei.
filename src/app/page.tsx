import styles from "./page.module.css";
import TopBar from "@/components/TopBar";
import { getDictionary } from "@/i18n/lang";

export default async function Home() {
  const { lang, t } = await getDictionary();

  return (
    <main className={`column ${styles.page}`}>
      <TopBar lang={lang} toggleLabel={t.langToggle.label} />

      <section className={styles.hero}>
        <h1 className="display-xl">{t.home.title}</h1>
        <p className={`body ${styles.muted}`}>{t.home.intro}</p>
      </section>

      <div className={styles.card}>
        <p className="label">{t.home.soonLabel}</p>
        <p className="body">{t.home.soonBody}</p>
      </div>
    </main>
  );
}
