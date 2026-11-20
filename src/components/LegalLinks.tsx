import Link from "next/link";

// Footer links to Impressum and Datenschutz (always German titles – that version applies legally).
export default function LegalLinks() {
  return (
    <p className="caption" style={{ display: "flex", gap: 16, color: "var(--ink-muted)" }}>
      <Link href="/impressum" style={{ color: "var(--ink-muted)" }}>
        Impressum
      </Link>
      <Link href="/datenschutz" style={{ color: "var(--ink-muted)" }}>
        Datenschutz
      </Link>
    </p>
  );
}
