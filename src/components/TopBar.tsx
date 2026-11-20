import Link from "next/link";
import LangToggle from "./LangToggle";
import type { Lang } from "@/i18n/dictionaries";

// Header shared by every screen: logo (→ home), optional "Anmelden" for guests, language toggle.
export default function TopBar({
  lang,
  toggleLabel,
  loginLabel,
}: {
  lang: Lang;
  toggleLabel: string;
  loginLabel?: string;
}) {
  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, minHeight: 44 }}>
      <Link href="/" className="title" style={{ color: "var(--ink)", textDecoration: "none" }}>
        dabei.
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {loginLabel && (
          <Link href="/login" className="label" style={{ color: "var(--ink)", minHeight: 44, display: "inline-flex", alignItems: "center", textUnderlineOffset: 3 }}>
            {loginLabel}
          </Link>
        )}
        <LangToggle lang={lang} label={toggleLabel} />
      </div>
    </header>
  );
}
