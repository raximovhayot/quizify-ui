import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

// Set global timezone to prevent markup mismatches
// eslint-disable-next-line no-process-env
process.env.TZ = 'UTC';

// Can be imported from a shared config
export const locales = ['en', 'ru', 'uz'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // Use requestLocale if available (from middleware), otherwise fallback to default
  let validLocale: string = 'en'; // Default fallback

  // First try to use the locale from the request (set by middleware)
  const resolvedRequestLocale = await requestLocale;
  if (
    resolvedRequestLocale &&
    locales.includes(resolvedRequestLocale as Locale)
  ) {
    validLocale = resolvedRequestLocale;
  } else {
    // Fall back to cookies for language preference
    try {
      const cookieStore = await cookies();
      const preferredLanguage = cookieStore.get('preferredLanguage')?.value;

      if (preferredLanguage && locales.includes(preferredLanguage as Locale)) {
        validLocale = preferredLanguage;
      }
    } catch {
      // This is expected during static generation; use the default locale.
    }
  }

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default,
  };
});
