import styles from "./profile.module.css";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import Field from "@/components/Field";
import { getDictionary } from "@/i18n/lang";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { INTERESTS, label } from "@/lib/interests";
import { saveProfile } from "./actions";
import { logout } from "../auth/actions";

// Profil: name, optional interests (from the "1 Interessen" design), sign out
export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  const user = await requireUser("/profile");
  const { saved } = await searchParams;
  const { lang, t } = await getDictionary();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,interests,is_admin")
    .eq("id", user.id)
    .single();
  const chosen = new Set<string>(profile?.interests ?? []);

  return (
    <main className={`column ${styles.page}`}>
      <TopBar lang={lang} toggleLabel={t.langToggle.label} />

      <h1 className="display-l">{t.profile.title}</h1>

      {saved === "1" && (
        <p role="status" className={`body ${styles.notice}`}>
          {t.profile.saved}
        </p>
      )}

      <form action={saveProfile} className={styles.form}>
        <Field id="name" label={t.profile.name} defaultValue={profile?.display_name ?? ""} autoComplete="given-name" required />
        <p className={`caption ${styles.muted}`}>{user.email}</p>

        <section className={styles.section} aria-labelledby="interests">
          <div>
            <h2 id="interests" className="title">
              {t.profile.interestsTitle}
            </h2>
            <p className={`body ${styles.muted}`}>{t.profile.interestsHint}</p>
          </div>
          {INTERESTS.map((cat) => (
            <fieldset key={cat.key} className={styles.group}>
              <legend className="heading">{label(cat, lang)}</legend>
              <div className={styles.chips}>
                <label className={styles.chip}>
                  <input type="checkbox" name="interests" value={cat.key} defaultChecked={chosen.has(cat.key)} />
                  <span>{label(cat, lang)}</span>
                </label>
                {cat.subs.map((sub) => {
                  const key = `${cat.key}:${sub.key}`;
                  return (
                    <label key={key} className={styles.chip}>
                      <input type="checkbox" name="interests" value={key} defaultChecked={chosen.has(key)} />
                      <span>{label(sub, lang)}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </section>

        <button type="submit" className="btn btn-primary btn-block">
          {t.profile.save}
        </button>
      </form>

      {profile?.is_admin && <p className={`caption ${styles.muted}`}>{t.profile.admin}</p>}

      <form action={logout}>
        <button type="submit" className="btn btn-secondary btn-block">
          {t.home.logout}
        </button>
      </form>

      <BottomNav t={t} active="profile" />
    </main>
  );
}
