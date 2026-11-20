import type { Metadata, Viewport } from "next";
// Fonts are self-hosted (no requests to Google from the visitor's browser – DSGVO-friendly).
import "@fontsource-variable/inter";
import "@fontsource/dm-serif-display";
import "./globals.css";

export const metadata: Metadata = {
  title: "dabei.",
  description: "Vom Speichern zum Hingehen – mit jemandem.",
};

export const viewport: Viewport = {
  themeColor: "#F8EEDB",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
