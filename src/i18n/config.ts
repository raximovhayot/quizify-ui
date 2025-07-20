import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'ru', 'uz'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async (params) => {
  // Handle case where no locale is provided (fallback to default)
  // In Next.js 15, notFound() cannot be used in root layout context
  // So we'll fallback to default locale instead
  let validLocale: string = 'en'; // Default fallback
  
  try {
    const locale = params?.locale;
    if (locale && locales.includes(locale as Locale)) {
      validLocale = locale;
    }
  } catch (error) {
    console.warn('Error processing locale, using default:', error);
  }

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default
  };
});