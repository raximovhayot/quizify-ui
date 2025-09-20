/* Simple analytics stub to avoid runtime/type errors.
   Replace with a real analytics provider (e.g., Sentry, PostHog) when available. */

export const analytics = {
  event(name: string, payload?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('[analytics:event]', name, payload);
    }
  },
  error(err: Error, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[analytics:error]', err, context);
    }
  },
};
