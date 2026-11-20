// Hand-drawn style icons per event type (same stroke language as the navigation icons).
export const CATEGORIES = ["kunst", "musik", "essen", "selber", "bewegung", "draussen", "treffen"] as const;
export type Category = (typeof CATEGORIES)[number];

const PATHS: Record<Category | "none", React.ReactNode> = {
  // framed picture
  kunst: (
    <>
      <path d="M4.4 5.2c5.1-.4 10.1-.3 15.2.1.3 4.6.3 9.2-.1 13.8-5 .3-10 .3-15-.1-.3-4.6-.3-9.2-.1-13.8z" />
      <path d="M6.6 16.4c1.9-2.6 3.6-4 5.1-3.8 1.4.2 2 2 3.4 2.2 1.1.1 2.1-.8 3.2-2" />
      <circle cx="9" cy="9.4" r="1.3" />
    </>
  ),
  // two notes
  musik: (
    <>
      <path d="M9.2 17.2V6.4c3.4-.9 6.6-1.6 9.9-2.2v10.9" />
      <ellipse cx="7" cy="17.4" rx="2.3" ry="1.9" />
      <ellipse cx="16.9" cy="15.2" rx="2.3" ry="1.9" />
    </>
  ),
  // wine glass
  essen: (
    <>
      <path d="M7.4 3.8c3.1-.2 6.1-.2 9.2 0 .5 3.3-.4 6.6-4.6 7.3-4.2-.7-5.1-4-4.6-7.3z" />
      <path d="M12 11.1c-.1 2.8 0 5.5.1 8.3" />
      <path d="M8.3 19.8c2.5-.3 5-.3 7.4 0" />
    </>
  ),
  // pottery vase
  selber: (
    <>
      <path d="M9.4 3.9c1.8.2 3.5.2 5.2 0-.2 1.5.3 2.6 1.6 3.7 2.1 1.8 2.8 4.6 2 7.3-.8 2.9-3.3 5-6.2 5-2.9 0-5.4-2.1-6.2-5-.8-2.7-.1-5.5 2-7.3 1.3-1.1 1.8-2.2 1.6-3.7z" />
      <path d="M7.2 12.6c3.2.6 6.4.6 9.6 0" />
    </>
  ),
  // moving figure
  bewegung: (
    <>
      <circle cx="14.6" cy="4.7" r="1.7" />
      <path d="M8.2 9.3c2.2-1.4 4.4-1.9 6.4-1.2l-1.6 5.2 3.4 2.6-1.2 4.4" />
      <path d="M13 13.3l-3.6 1.3-2.6 3.6" />
      <path d="M14.6 8.1c.9 1.4 2.3 2.2 4.1 2.4" />
    </>
  ),
  // tree and sun
  draussen: (
    <>
      <path d="M9.4 20.2c-.2-3.1-.2-6.2.1-9.3" />
      <path d="M9.5 12.9c-3.6.4-5.6-1.6-5.3-4.4.3-2.6 2.6-4.5 5.3-4.4 2.8.1 4.9 2.2 4.8 4.8-.1 2.3-1.8 3.8-4.8 4z" />
      <circle cx="17.6" cy="6.4" r="2" />
      <path d="M3.8 20.4c5.4-.4 10.9-.4 16.4.1" />
    </>
  ),
  // two people at a table
  treffen: (
    <>
      <circle cx="7.6" cy="7.4" r="2.3" />
      <circle cx="16.4" cy="7.4" r="2.3" />
      <path d="M3.4 15.2c5.7-.4 11.4-.4 17.2 0" />
      <path d="M6.2 15.4c-.2 1.7-.1 3.3.2 4.9M17.8 15.4c.2 1.7.1 3.3-.2 4.9" />
    </>
  ),
  // no type: the dabei. dots
  none: (
    <>
      <circle cx="9" cy="16" r="1.6" fill="currentColor" />
      <circle cx="15" cy="16" r="1.6" fill="currentColor" />
    </>
  ),
};

export default function CategoryIcon({ category, size = 24 }: { category: string | null; size?: number }) {
  const key = (CATEGORIES as readonly string[]).includes(category ?? "") ? (category as Category) : "none";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[key]}
    </svg>
  );
}
