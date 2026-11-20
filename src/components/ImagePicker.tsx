"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** Shrink a photo to max 1200 px wide as JPEG (keeps uploads small on mobile data). */
async function resize(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("resize failed"))), "image/jpeg", 0.82),
  );
}

// Photo for an event: uploads straight to storage, then puts the URL into a hidden form field.
export default function ImagePicker({
  userId,
  initialUrl,
  labels,
}: {
  userId: string;
  initialUrl: string | null;
  labels: { title: string; add: string; change: string; remove: string; uploading: string; error: string };
}) {
  const input = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(false);
    try {
      const blob = await resize(file);
      const supabase = createClient();
      const path = `${userId}/event-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from("event-images").upload(path, blob, { contentType: "image/jpeg" });
      if (upErr) throw upErr;
      setUrl(supabase.storage.from("event-images").getPublicUrl(path).data.publicUrl);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span className="label">{labels.title}</span>
      <input type="hidden" name="image_url" value={url ?? ""} />
      <input ref={input} type="file" accept="image/*" onChange={onPick} hidden />
      {url && (
        <img
          src={url}
          alt=""
          style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", borderRadius: "var(--radius-card) var(--radius-card) var(--radius-card) var(--radius-notch)" }}
        />
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="btn btn-secondary" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? labels.uploading : url ? labels.change : labels.add}
        </button>
        {url && !busy && (
          <button type="button" className="btn btn-secondary" onClick={() => setUrl(null)}>
            {labels.remove}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="caption" style={{ color: "var(--burgundy)" }}>
          {labels.error}
        </p>
      )}
    </div>
  );
}
