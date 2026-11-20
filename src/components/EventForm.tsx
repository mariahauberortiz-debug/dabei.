import Field from "./Field";
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
}: {
  t: Dictionary;
  action: (formData: FormData) => Promise<void>;
  event?: EventRow;
  submitLabel: string;
  className?: string;
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
      <Field id="date" label={t.newEvent.date} type="date" defaultValue={start?.date} />
      <div className={fieldStyles.row}>
        <Field id="start_time" label={t.newEvent.startTime} type="time" defaultValue={start?.time} />
        <Field id="end_time" label={t.newEvent.endTime} type="time" defaultValue={endIsTime ? end?.time : undefined} />
      </div>
      <Field id="ends_on" label={t.newEvent.endsAt} hint={t.newEvent.endsAtHint} type="date" defaultValue={!endIsTime ? end?.date : undefined} />
      <Field id="location" label={t.newEvent.location} hint={t.newEvent.locationHint} defaultValue={event?.location ?? undefined} />
      <Field id="description" label={t.newEvent.description} multiline defaultValue={event?.description ?? undefined} />
      <button type="submit" className="btn btn-primary btn-block">
        {submitLabel}
      </button>
    </form>
  );
}
