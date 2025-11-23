import dynamic from 'next/dynamic';

import type { MathLiveDialogProps } from '../MathLiveDialog';

/**
 * Lazy-loaded MathLive dialog component
 * 
 * MathLive is loaded only when needed to reduce initial bundle size.
 * The component is client-side only (ssr: false) because MathLive
 * requires browser APIs.
 */
export const MathLiveDialogLazy = dynamic<MathLiveDialogProps>(
  () => import('../MathLiveDialog').then((mod) => mod.MathLiveDialog),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    ),
  }
);
