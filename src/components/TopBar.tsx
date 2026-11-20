import LangToggle from "./LangToggle";
import type { Lang } from "@/i18n/dictionaries";

// Header shared by every screen: logo + language toggle.
export default function TopBar({ lang, toggleLabel }: { lang: Lang; toggleLabel: string }) {
  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 44 }}>
      <p className="title">dabei.</p>
      <LangToggle lang={lang} label={toggleLabel} />
    </header>
  );
}
