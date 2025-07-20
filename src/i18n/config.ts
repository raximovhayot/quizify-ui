import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

// Can be imported from a shared config
export const locales = ['en', 'ru', 'uz'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  // Get locale from cookies (works on both server and client)
  let validLocale: string = 'en'; // Default fallback
  
  try {
    const cookieStore = await cookies();
    const preferredLanguage = cookieStore.get('preferredLanguage')?.value;
    
    if (preferredLanguage && locales.includes(preferredLanguage as Locale)) {
      validLocale = preferredLanguage;
    }
  } catch (error) {
    console.warn('Error processing locale from cookies, using default:', error);
  }

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default
  };
});