"use client";

import { useState } from "react";

// WhatsApp share (wa.me link with the message pre-filled) + copy link.
export default function ShareButtons({
  link,
  message,
  labels,
}: {
  link: string;
  message: string;
  labels: { whatsapp: string; copy: string; copied: string };
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("", link);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary btn-block"
      >
        {labels.whatsapp}
      </a>
      <button type="button" onClick={copy} className="btn btn-secondary btn-block" aria-live="polite">
        {copied ? labels.copied : labels.copy}
      </button>
    </div>
  );
}
