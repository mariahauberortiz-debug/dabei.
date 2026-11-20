import type { Lang } from "@/i18n/dictionaries";

// Interest categories from the "1 Interessen" screen in Claude Design.
// Stored as keys: "kunst" for a category, "kunst:ausstellungen" for a sub-topic.
type Item = { key: string; de: string; en: string };
export const INTERESTS: (Item & { subs: Item[] })[] = [
  {
    key: "kunst", de: "Kunst & Kultur", en: "Art & culture",
    subs: [
      { key: "ausstellungen", de: "Ausstellungen", en: "Exhibitions" },
      { key: "theater", de: "Theater", en: "Theatre" },
      { key: "lesungen", de: "Lesungen", en: "Readings" },
      { key: "kino", de: "Kino", en: "Cinema" },
    ],
  },
  {
    key: "musik", de: "Musik", en: "Music",
    subs: [
      { key: "konzerte", de: "Konzerte", en: "Concerts" },
      { key: "clubs", de: "Clubs", en: "Clubs" },
      { key: "jazz", de: "Jazz", en: "Jazz" },
      { key: "klassik", de: "Klassik", en: "Classical" },
    ],
  },
  {
    key: "essen", de: "Essen & Trinken", en: "Food & drink",
    subs: [
      { key: "kaffee", de: "Kaffee", en: "Coffee" },
      { key: "wein", de: "Wein", en: "Wine" },
      { key: "kochkurse", de: "Kochkurse", en: "Cooking classes" },
      { key: "maerkte", de: "Märkte", en: "Markets" },
    ],
  },
  {
    key: "selber", de: "Selber machen", en: "Making things",
    subs: [
      { key: "keramik", de: "Keramik", en: "Ceramics" },
      { key: "siebdruck", de: "Siebdruck", en: "Screen printing" },
      { key: "naehen", de: "Nähen", en: "Sewing" },
      { key: "holz", de: "Holz", en: "Woodwork" },
    ],
  },
  {
    key: "bewegung", de: "Bewegung", en: "Movement",
    subs: [
      { key: "tanzen", de: "Tanzen", en: "Dancing" },
      { key: "yoga", de: "Yoga", en: "Yoga" },
      { key: "klettern", de: "Klettern", en: "Climbing" },
      { key: "laufen", de: "Laufen", en: "Running" },
    ],
  },
  {
    key: "draussen", de: "Draußen", en: "Outdoors",
    subs: [
      { key: "parks", de: "Parks", en: "Parks" },
      { key: "radtouren", de: "Radtouren", en: "Bike rides" },
      { key: "baden", de: "Baden", en: "Swimming outdoors" },
      { key: "flohmaerkte", de: "Flohmärkte", en: "Flea markets" },
    ],
  },
];

export const ALL_INTEREST_KEYS = new Set(
  INTERESTS.flatMap((c) => [c.key, ...c.subs.map((s) => `${c.key}:${s.key}`)]),
);

export const label = (item: Item, lang: Lang) => (lang === "de" ? item.de : item.en);
