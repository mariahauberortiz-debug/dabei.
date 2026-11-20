/* eslint-disable @next/next/no-img-element */
// Event image, or the dabei. duotone placeholder (periwinkle → olive) when there is none.
export default function Photo({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (src) return <img src={src} alt={alt} className={className} style={{ objectFit: "cover" }} />;
  return (
    <span
      className={className}
      role="img"
      aria-label={alt}
      style={{ display: "block", background: "linear-gradient(135deg, var(--periwinkle), var(--olive))" }}
    />
  );
}
