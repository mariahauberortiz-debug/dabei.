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
    signup: "Konto erstellen",
    login: "Ich habe schon ein Konto",
    hello: "Hallo",
    signedInBody: "Du bist angemeldet. Deine Pläne und Events kommen hier bald hin.",
    logout: "Abmelden",
  },
  auth: {
    signupTitle: "Konto erstellen",
    signupIntro: "Damit du sehen kannst, wer dabei ist – und die anderen dich.",
    loginTitle: "Anmelden",
    name: "Dein Vorname",
    nameHint: "So sehen dich die anderen in der Liste.",
    email: "E-Mail",
    password: "Passwort",
    passwordHint: "Mindestens 8 Zeichen.",
    signupButton: "Konto erstellen",
    loginButton: "Anmelden",
    toLogin: "Schon ein Konto? Anmelden",
    toSignup: "Noch kein Konto? Konto erstellen",
    checkEmail: "Fast geschafft: Bestätige deine E-Mail-Adresse über den Link, den wir dir geschickt haben.",
    errors: {
      invalid: "E-Mail oder Passwort stimmt nicht.",
      exists: "Mit dieser E-Mail gibt es schon ein Konto. Melde dich an.",
      weak: "Das Passwort braucht mindestens 8 Zeichen.",
      missing: "Bitte fülle alle Felder aus.",
      unknown: "Das hat nicht geklappt. Versuch es bitte noch einmal.",
    },
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
    signup: "Create account",
    login: "I already have an account",
    hello: "Hi",
    signedInBody: "You're signed in. Your plans and events will show up here soon.",
    logout: "Sign out",
  },
  auth: {
    signupTitle: "Create account",
    signupIntro: "So you can see who's in – and they can see you.",
    loginTitle: "Sign in",
    name: "Your first name",
    nameHint: "This is how others see you on the list.",
    email: "Email",
    password: "Password",
    passwordHint: "At least 8 characters.",
    signupButton: "Create account",
    loginButton: "Sign in",
    toLogin: "Already have an account? Sign in",
    toSignup: "No account yet? Create one",
    checkEmail: "Almost there: confirm your email address with the link we just sent you.",
    errors: {
      invalid: "Email or password is incorrect.",
      exists: "There's already an account with this email. Please sign in.",
      weak: "The password needs at least 8 characters.",
      missing: "Please fill in all fields.",
      unknown: "That didn't work. Please try again.",
    },
  },
};

export const dictionaries: Record<Lang, Dictionary> = { de, en };
