import { cookies, headers } from "next/headers";
import { dictionaries, languages, type Lang } from "./dictionaries";

export const LANG_COOKIE = "lang";

function isLang(value: string | undefined): value is Lang {
  return !!value && (languages as readonly string[]).includes(value);
}

/**
 * Language for this request:
 * 1. the choice saved by the toggle (cookie),
 * 2. otherwise the browser language (German browsers → de),
 * 3. otherwise English.
 */
export async function getLang(): Promise<Lang> {
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  if (isLang(saved)) return saved;

  const accept = (await headers()).get("accept-language") ?? "";
  return accept.toLowerCase().startsWith("de") ? "de" : "en";
}

export async function getDictionary() {
  const lang = await getLang();
  return { lang, t: dictionaries[lang] };
}
