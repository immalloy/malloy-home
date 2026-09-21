import { defineConfig } from "astro/config";
export default defineConfig({
  site: "https://immalloy.com",
  output: "static",
  i18n: {
    locales: ["en", "es"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
      fallbackType: "redirect"
    }
  }
});
