import Link from "next/link";
import TopBar from "@/components/TopBar";
import { getDictionary } from "@/i18n/lang";
import { requireUser } from "@/lib/auth";

// Placeholder until Dev 4 (invite + date + share via WhatsApp) is built.
export default async function PlanPage({ params }: PageProps<"/events/[id]/plan">) {
  const { id } = await params;
  await requireUser(`/events/${id}/plan`);
  const { lang, t } = await getDictionary();

  return (
    <main className="column" style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 32 }}>
      <TopBar lang={lang} toggleLabel={t.langToggle.label} />
      <p className="body">{t.plan.comingSoon}</p>
      <Link href={`/events/${id}`} className="btn btn-secondary">
        {t.event.back}
      </Link>
    </main>
  );
}
