import styles from "./Field.module.css";

type Props = {
  id: string;
  label: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

// Label + input in the dabei. style (radius-field with the notch corner).
export default function Field({ id, label, hint, ...input }: Props) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input id={id} name={id} className={styles.input} aria-describedby={hint ? `${id}-hint` : undefined} {...input} />
      {hint && (
        <p id={`${id}-hint`} className={`caption ${styles.hint}`}>
          {hint}
        </p>
      )}
    </div>
  );
}
