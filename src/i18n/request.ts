import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import en from "../../messages/en.json";
import fr from "../../messages/fr.json";
import de from "../../messages/de.json";
import th from "../../messages/th.json";

const allMessages = { en, fr, de, th };

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: allMessages[locale as keyof typeof allMessages],
  };
});
