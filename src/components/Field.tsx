import styles from "./Field.module.css";

type Props = {
  id: string;
  label: string;
  hint?: string;
  multiline?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

// Label + input (or textarea) in the dabei. style (radius-field with the notch corner).
export default function Field({ id, label, hint, multiline, ...input }: Props) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={id}
          rows={4}
          className={`${styles.input} ${styles.textarea}`}
          aria-describedby={hint ? `${id}-hint` : undefined}
          placeholder={input.placeholder}
          defaultValue={input.defaultValue as string | undefined}
          required={input.required}
          maxLength={input.maxLength}
        />
      ) : (
        <input id={id} name={id} className={styles.input} aria-describedby={hint ? `${id}-hint` : undefined} {...input} />
      )}
      {hint && (
        <p id={`${id}-hint`} className={`caption ${styles.hint}`}>
          {hint}
        </p>
      )}
    </div>
  );
}
