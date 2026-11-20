import Field from "./Field";
import ImagePicker from "./ImagePicker";
import CategoryIcon, { CATEGORIES } from "./CategoryIcon";
import chip from "./Chips.module.css";
import fieldStyles from "./Field.module.css";
import type { Dictionary } from "@/i18n/dictionaries";
import type { EventRow } from "@/lib/events";
import { toBerlinParts } from "@/lib/dates";

// Screen 3 form, used for adding and editing an event.
export default function EventForm({
  t,
  action,
  event,
  submitLabel,
  className,
  userId,
  isAdmin = false,
}: {
  t: Dictionary;
  action: (formData: FormData) => Promise<void>;
  event?: EventRow;
  submitLabel: string;
  className?: string;
  userId: string;
  isAdmin?: boolean;
}) {
  const start = event?.starts_at ? toBerlinParts(event.starts_at) : null;
  const end = event?.ends_at ? toBerlinParts(event.ends_at) : null;
  // An end on the same day as the start is an end time; otherwise it's "runs until".
  const endIsTime = !!(start && end && start.date === end.date);

  return (
    <form action={action} className={className}>
      {event && <input type="hidden" name="id" value={event.id} />}
      <Field id="url" label={t.newEvent.link} hint={t.newEvent.linkHint} type="text" inputMode="url" autoComplete="off" defaultValue={event?.url ?? undefined} />
      <Field id="title" label={t.newEvent.name} placeholder={t.newEvent.namePlaceholder} defaultValue={event?.title} required />
      <Field id="date" label={t.newEvent.date} type="date" min="2024-01-01" max="2100-12-31" defaultValue={start?.date} />
      <div className={fieldStyles.row}>
        <Field id="start_time" label={t.newEvent.startTime} type="time" defaultValue={start?.time} />
        <Field id="end_time" label={t.newEvent.endTime} type="time" defaultValue={endIsTime ? end?.time : undefined} />
      </div>
      <Field id="ends_on" label={t.newEvent.endsAt} hint={t.newEvent.endsAtHint} type="date" min="2024-01-01" max="2100-12-31" defaultValue={!endIsTime ? end?.date : undefined} />
      <Field id="location" label={t.newEvent.location} hint={t.newEvent.locationHint} defaultValue={event?.location ?? undefined} />
      <fieldset style={{ margin: 0, padding: 0, border: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        <legend className="label" style={{ padding: 0, marginBottom: 8 }}>
          {t.newEvent.category}
        </legend>
        <div className={chip.chips}>
          {CATEGORIES.map((c) => (
            <label key={c} className={chip.chip}>
              <input type="radio" name="category" value={c} defaultChecked={event?.category === c} />
              <span>
                <CategoryIcon category={c} size={18} />
                {t.newEvent.categories[c]}
              </span>
            </label>
          ))}
        </div>
        <p className="caption" style={{ color: "var(--ink-muted)" }}>
          {t.newEvent.categoryHint}
        </p>
      </fieldset>
      <Field id="description" label={t.newEvent.description} multiline defaultValue={event?.description ?? undefined} />
      <ImagePicker
        userId={userId}
        initialUrl={event?.image_url ?? null}
        labels={{
          title: t.newEvent.image,
          add: t.newEvent.imageAdd,
          change: t.newEvent.imageChange,
          remove: t.newEvent.imageRemove,
          uploading: t.newEvent.imageUploading,
          error: t.newEvent.imageError,
        }}
      />
      {isAdmin && (
        <label className="body" style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 44, cursor: "pointer" }}>
          <input
            type="checkbox"
            name="curated"
            value="1"
            defaultChecked={event?.source === "curated"}
            style={{ width: 22, height: 22, accentColor: "var(--ink)" }}
          />
          {t.newEvent.curated}
        </label>
      )}
      <button type="submit" className="btn btn-primary btn-block">
        {submitLabel}
      </button>
    </form>
  );
}
