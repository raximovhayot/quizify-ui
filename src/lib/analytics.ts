/* Simple analytics stub to avoid runtime/type errors.
   Replace with a real analytics provider (e.g., Sentry, PostHog) when available. */

const isDev =
  // eslint-disable-next-line no-process-env
  process.env.NODE_ENV !== 'production';

export const analytics = {
  event(name: string, payload?: Record<string, unknown>) {
    if (isDev) {
      console.log('[analytics:event]', name, payload);
    }
  },
  error(err: Error, context?: Record<string, unknown>) {
    if (isDev) {
      console.error('[analytics:error]', err, context);
    }
  },
};
