import { setLang } from "@/i18n/actions";
import { languages, type Lang } from "@/i18n/dictionaries";
import styles from "./LangToggle.module.css";

// DE | EN switch. Works without JavaScript: each option is a small form submit.
export default function LangToggle({ lang, label }: { lang: Lang; label: string }) {
  return (
    <form action={setLang} className={styles.toggle} aria-label={label}>
      {languages.map((l) => (
        <button
          key={l}
          type="submit"
          name="lang"
          value={l}
          aria-pressed={l === lang}
          className={l === lang ? `${styles.option} ${styles.active}` : styles.option}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </form>
  );
}
