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
    // Only try to read cookies if we're in a dynamic context
    try {
      const cookieStore = await cookies();
      const preferredLanguage = cookieStore.get('preferredLanguage')?.value;

      if (preferredLanguage && locales.includes(preferredLanguage as Locale)) {
        validLocale = preferredLanguage;
      }
    } catch (error) {
      // This is expected during static generation, just use the default
      console.warn(
        'Error processing locale from cookies, using default:',
        error
      );
    }
  }

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default,
  };
});
