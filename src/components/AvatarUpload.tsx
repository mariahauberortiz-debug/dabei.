"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Avatar from "./Avatar";

/** Shrink a photo to max 512 px (square crop) as JPEG, so uploads stay small on mobile data. */
async function resize(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const size = Math.min(bitmap.width, bitmap.height);
  const out = Math.min(512, size);
  const canvas = document.createElement("canvas");
  canvas.width = out;
  canvas.height = out;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, (bitmap.width - size) / 2, (bitmap.height - size) / 2, size, size, 0, 0, out, out);
  return await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("resize failed"))), "image/jpeg", 0.85),
  );
}

export default function AvatarUpload({
  userId,
  name,
  url,
  labels,
}: {
  userId: string;
  name: string;
  url: string | null;
  labels: { change: string; add: string; remove: string; error: string; uploading: string };
}) {
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [preview, setPreview] = useState<string | null>(url);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(false);
    try {
      const blob = await resize(file);
      const supabase = createClient();
      const path = `${userId}/avatar-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, blob, { contentType: "image/jpeg" });
      if (upErr) throw upErr;
      const publicUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
      if (dbErr) throw dbErr;
      setPreview(publicUrl);
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function onRemove() {
    setBusy(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId);
    setPreview(null);
    setBusy(false);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <Avatar name={name} url={preview} size={88} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
        <input ref={input} type="file" accept="image/*" onChange={onPick} hidden />
        <button type="button" className="btn btn-secondary" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? labels.uploading : preview ? labels.change : labels.add}
        </button>
        {preview && !busy && (
          <button
            type="button"
            onClick={onRemove}
            style={{ border: 0, background: "none", padding: 0, minHeight: 32, color: "var(--ink-muted)", textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13 }}
          >
            {labels.remove}
          </button>
        )}
        {error && (
          <p role="alert" className="caption" style={{ color: "var(--burgundy)" }}>
            {labels.error}
          </p>
        )}
      </div>
    </div>
  );
}
