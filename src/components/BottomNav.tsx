import Link from "next/link";
import styles from "./BottomNav.module.css";
import type { Dictionary } from "@/i18n/dictionaries";

type Tab = "start" | "plans" | "profile";

// Bottom navigation from the design (Start · Pläne · Profil), hand-drawn icons.
export default function BottomNav({ t, active }: { t: Dictionary; active: Tab }) {
  const items: { key: Tab; href: string; label: string; icon: React.ReactNode }[] = [
    {
      key: "start",
      href: "/",
      label: t.nav.start,
      icon: (
        <>
          <path d="M3.2 9.6c.6-4.4 5.4-7 9.8-6.2s7.9 4.6 7.4 9.2-4.6 8.4-9.2 8.2S2.6 14 3.2 9.6z" fill="var(--cream)" stroke="none" />
          <path d="M5.6 20.6C5.3 17 5.2 13.8 5.6 11.4 6.3 7.3 8.8 4.3 12.1 4.2c3.5 0 6 3 6.3 7.1.2 3.1.1 6.3-.1 9.3" />
          <path d="M3.6 20.8c5.4-.4 11.3-.3 16.8.1" />
          <circle cx="12" cy="12.6" r="1.3" fill="currentColor" stroke="none" />
        </>
      ),
    },
    {
      key: "plans",
      href: "/plans",
      label: t.nav.plans,
      icon: (
        <>
          <ellipse cx="8.9" cy="12.6" rx="4.4" ry="5.1" transform="rotate(-14 8.9 12.6)" />
          <ellipse cx="15.3" cy="11.4" rx="4.2" ry="4.9" transform="rotate(16 15.3 11.4)" />
        </>
      ),
    },
    {
      key: "profile",
      href: "/profile",
      label: t.nav.profile,
      icon: (
        <>
          <path d="M12.2 3.6c2.4.1 3.9 2 3.8 4.3-.1 2.5-1.9 4.2-4.1 4.1-2.3-.1-3.9-1.9-3.8-4.3.1-2.3 1.8-4.2 4.1-4.1z" />
          <path d="M4.4 20.6c.6-3.4 3.9-5.9 7.7-5.8 3.7.1 6.8 2.5 7.5 5.9" />
        </>
      ),
    },
  ];

  return (
    <nav aria-label={t.nav.label} className={styles.nav}>
      <div className={styles.inner}>
        {items.map((it) => (
          <Link
            key={it.key}
            href={it.href}
            aria-current={active === it.key ? "page" : undefined}
            className={active === it.key ? `${styles.item} ${styles.active}` : styles.item}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {it.icon}
            </svg>
            {it.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
