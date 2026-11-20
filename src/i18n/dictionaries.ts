// All UI copy lives here, one entry per language.
// To add or change a text: edit both `de` and `en` so the screens stay in sync.

export const languages = ["de", "en"] as const;
export type Lang = (typeof languages)[number];

const de = {
  meta: {
    description: "Vom Speichern zum Hingehen – mit jemandem.",
  },
  langToggle: {
    label: "Sprache",
  },
  home: {
    title: "Gespeichert ist nicht erlebt.",
    intro: "Aus dem, was du dir vorgenommen hast, wird ein Plan – mit jemandem, der dabei ist.",
    soonLabel: "Bald geht's los",
    soonBody: "Die erste Version ist im Aufbau. Du bekommst einen Link, sobald du dich anmelden kannst.",
  },
};

export type Dictionary = typeof de;

const en: Dictionary = {
  meta: {
    description: "From saving to actually going – with someone.",
  },
  langToggle: {
    label: "Language",
  },
  home: {
    title: "Saved isn't lived.",
    intro: "What you've been meaning to do becomes a plan – with someone who's in.",
    soonLabel: "Coming soon",
    soonBody: "The first version is being built. You'll get a link as soon as you can sign up.",
  },
};

export const dictionaries: Record<Lang, Dictionary> = { de, en };
