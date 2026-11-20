import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={`column ${styles.page}`}>
      <p className="title">dabei.</p>

      <section className={styles.hero}>
        <h1 className="display-xl">Gespeichert ist nicht erlebt.</h1>
        <p className={`body ${styles.muted}`}>
          Aus dem, was du dir vorgenommen hast, wird ein Plan – mit jemandem, der dabei ist.
        </p>
      </section>

      <div className={styles.card}>
        <p className="label">Bald geht&apos;s los</p>
        <p className="body">
          Die erste Version ist im Aufbau. Du bekommst einen Link, sobald du dich anmelden kannst.
        </p>
      </div>
    </main>
  );
}
