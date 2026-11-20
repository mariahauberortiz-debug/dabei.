import TopBar from "@/components/TopBar";
import { getDictionary } from "@/i18n/lang";

// Impressum (§ 5 DDG). Placeholders in [ ] must be filled in by Haubi before launch.
export default async function ImpressumPage() {
  const { lang, t } = await getDictionary();
  return (
    <main className="column" style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 32, paddingBottom: 48 }}>
      <TopBar lang={lang} toggleLabel={t.langToggle.label} />
      <h1 className="display-l">Impressum</h1>
      {lang === "en" && <p className="caption">This page is only available in German, the legally binding version.</p>}
      <section className="body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p>
          <strong>Angaben gemäß § 5 DDG</strong>
          <br />
          [VOR- UND NACHNAME]
          <br />
          [STRASSE UND HAUSNUMMER]
          <br />
          [PLZ] Berlin
        </p>
        <p>
          <strong>Kontakt</strong>
          <br />
          E-Mail: [E-MAIL-ADRESSE]
        </p>
        <p>
          <strong>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</strong>
          <br />
          [VOR- UND NACHNAME], Anschrift wie oben
        </p>
        <p>
          dabei. ist ein privates, nicht-kommerzielles Pilotprojekt im Rahmen einer Weiterbildung. Der Zugang ist nur mit
          Einladung möglich.
        </p>
      </section>
    </main>
  );
}
