/* eslint-disable @next/next/no-img-element */
import CategoryIcon from "./CategoryIcon";

// Event image, or the dabei. duotone placeholder (periwinkle → olive) with an icon for the event type.
export default function Photo({
  src,
  alt,
  className,
  category = null,
  iconSize = 36,
}: {
  src: string | null;
  alt: string;
  className?: string;
  category?: string | null;
  iconSize?: number;
}) {
  if (src) return <img src={src} alt={alt} className={className} style={{ objectFit: "cover" }} />;
  return (
    <span
      className={className}
      role="img"
      aria-label={alt}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--cream)",
        background: "linear-gradient(135deg, var(--periwinkle), var(--olive))",
      }}
    >
      <CategoryIcon category={category} size={iconSize} />
    </span>
  );
}
