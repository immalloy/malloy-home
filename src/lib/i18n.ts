export type Locale = "en" | "es";

export const getLocale = (value: unknown): Locale => value === "es" ? "es" : "en";

export const tx = (locale: Locale, english: string, spanish: string) =>
  locale === "es" ? spanish : english;

export const localizedPath = (locale: Locale, path: string) =>
  locale === "es" ? `/es${path === "/" ? "" : path}` : path;
