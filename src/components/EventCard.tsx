import Link from "next/link";
import styles from "./EventCard.module.css";
import Photo from "./Photo";
import type { EventRow } from "@/lib/events";
import type { Dictionary, Lang } from "@/i18n/dictionaries";
import { daysUntil, formatDate, formatRange } from "@/lib/dates";

// List card from screen 4 (thumbnail + badge + serif title + meta line).
export default function EventCard({
  event,
  lang,
  t,
  showEndsIn = false,
}: {
  event: EventRow;
  lang: Lang;
  t: Dictionary;
  showEndsIn?: boolean;
}) {
  const curated = event.source === "curated";
  const when = event.starts_at
    ? formatRange(event.starts_at, event.ends_at, lang)
    : event.ends_at
      ? `${t.event.until} ${formatDate(event.ends_at, lang)}`
      : null;
  const meta = [when, event.location].filter(Boolean).join(" · ");

  return (
    <Link href={`/events/${event.id}`} className={styles.card}>
      <Photo src={event.image_url} alt={event.title} className={styles.thumb} />
      <span className={styles.body}>
        <span className={styles.badges}>
          <span className={curated ? `${styles.badge} ${styles.badgeCurated}` : styles.badge}>
            {curated ? t.event.badgeCurated : t.event.badgeOwn}
          </span>
          {showEndsIn && event.ends_at && (
            <span className={styles.urgent}>{t.event.endsInDays(daysUntil(event.ends_at))}</span>
          )}
        </span>
        <span className={`title ${styles.title}`}>{event.title}</span>
        {meta && <span className={`body ${styles.meta}`}>{meta}</span>}
      </span>
    </Link>
  );
}
