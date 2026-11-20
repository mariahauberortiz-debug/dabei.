import TopBar from "@/components/TopBar";
import { getDictionary } from "@/i18n/lang";

// Datenschutzerklärung – draft. Placeholders in [ ] must be filled in, and the text should be checked before launch.
export default async function DatenschutzPage() {
  const { lang, t } = await getDictionary();
  const h = { margin: "8px 0 0" } as const;
  return (
    <main className="column" style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 32, paddingBottom: 48 }}>
      <TopBar lang={lang} toggleLabel={t.langToggle.label} />
      <h1 className="display-l">Datenschutz</h1>
      {lang === "en" && <p className="caption">This page is only available in German, the legally binding version.</p>}
      <section className="body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 className="heading" style={h}>1. Verantwortliche</h2>
        <p>[VOR- UND NACHNAME], [ANSCHRIFT], [E-MAIL-ADRESSE]</p>

        <h2 className="heading" style={h}>2. Welche Daten wir verarbeiten</h2>
        <p>
          Wenn du ein Konto erstellst: Vorname, E-Mail-Adresse und Passwort (verschlüsselt gespeichert). Freiwillig: Foto,
          kurze Beschreibung über dich und Interessen. Wenn du dabei. nutzt: deine Events, Pläne, Zu- und Absagen, ob du einen
          Plan in deinen Kalender übernommen oder jemanden erinnert hast und ob du bei einem Plan dabei warst.
        </p>

        <h2 className="heading" style={h}>3. Wofür</h2>
        <p>
          Um die App bereitzustellen (Art. 6 Abs. 1 lit. b DSGVO) und um im Pilotprojekt auszuwerten, ob dabei. Menschen hilft,
          Vorhaben wirklich umzusetzen (Art. 6 Abs. 1 lit. f DSGVO). Die Auswertung erfolgt nur zusammengefasst. Es gibt keine
          Werbung, kein Tracking und keine Weitergabe an Dritte zu Werbezwecken.
        </p>

        <h2 className="heading" style={h}>4. Wer deine Daten sieht</h2>
        <p>
          Personen in einem gemeinsamen Plan sehen deinen Vornamen, dein Foto und deine Beschreibung. Wer einen
          Einladungslink hat, sieht Event, Termin und die Vornamen und Fotos der Teilnehmenden.
        </p>

        <h2 className="heading" style={h}>5. Dienstleister</h2>
        <p>
          Hosting: Vercel Inc. (Webseite). Datenbank, Konten und Bilder: Supabase Inc., Server in der EU (Irland). Mit beiden
          bestehen Auftragsverarbeitungsverträge [BITTE PRÜFEN]. Schriften werden von unserem eigenen Server geladen, nicht
          von Google.
        </p>

        <h2 className="heading" style={h}>6. Cookies</h2>
        <p>Nur technisch notwendige Cookies: deine Anmeldung und deine Sprachwahl. Keine Analyse- oder Werbe-Cookies.</p>

        <h2 className="heading" style={h}>7. Speicherdauer</h2>
        <p>Solange dein Konto besteht. Nach Ende des Pilotprojekts oder auf Wunsch löschen wir dein Konto und deine Daten.</p>

        <h2 className="heading" style={h}>8. Deine Rechte</h2>
        <p>
          Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch. Schreib
          dafür an [E-MAIL-ADRESSE]. Du kannst dich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren, in Berlin bei
          der Berliner Beauftragten für Datenschutz und Informationsfreiheit.
        </p>

        <p className="caption" style={{ color: "var(--ink-muted)" }}>Stand: [DATUM]</p>
      </section>
    </main>
  );
}
