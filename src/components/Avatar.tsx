/* eslint-disable @next/next/no-img-element */
// Profile photo in the organic blob shape from the design, or the initial when there is no photo.
const BLOB = "58% 42% 55% 45% / 48% 56% 44% 52%";

export default function Avatar({ name, url, size = 34 }: { name: string; url: string | null; size?: number }) {
  const common: React.CSSProperties = { width: size, height: size, flex: "none", borderRadius: BLOB, overflow: "hidden" };
  if (url) return <img src={url} alt="" style={{ ...common, objectFit: "cover" }} />;
  return (
    <span
      aria-hidden="true"
      style={{
        ...common,
        background: "var(--cream)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontSize: Math.round(size / 2),
      }}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}
