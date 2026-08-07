import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "./config";

export async function getServerLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get("store-locale")?.value;
  return isLocale(cookieLocale) ? cookieLocale : defaultLocale;
}
