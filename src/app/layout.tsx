import type { Metadata, Viewport } from "next";
// Fonts are self-hosted (no requests to Google from the visitor's browser – DSGVO-friendly).
import "@fontsource-variable/inter";
import "@fontsource/dm-serif-display";
import "./globals.css";
import { getDictionary, getLang } from "@/i18n/lang";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: "dabei.", description: t.meta.description };
}

export const viewport: Viewport = {
  themeColor: "#F8EEDB",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
