"use server";

import { cookies } from "next/headers";
import { languages, type Lang } from "./dictionaries";
import { LANG_COOKIE } from "./lang";

export async function setLang(formData: FormData) {
  const value = formData.get("lang");
  if (typeof value !== "string" || !(languages as readonly string[]).includes(value)) return;

  (await cookies()).set(LANG_COOKIE, value as Lang, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
}
