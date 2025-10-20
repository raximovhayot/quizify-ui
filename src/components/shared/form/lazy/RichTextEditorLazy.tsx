'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import type { RichTextEditorProps } from '../RichTextEditor';

/**
 * Loading skeleton for RichTextEditor
 */
function RichTextEditorSkeleton({ 
  className, 
  minHeight = '120px' 
}: { 
  className?: string; 
  minHeight?: string;
}) {
  return (
    <div
      className={cn(
        'border rounded-xl overflow-hidden bg-background',
        className
      )}
    >
      <div className="border-b bg-muted/20 p-2 flex flex-wrap items-center gap-1">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="p-3" style={{ minHeight }}>
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

/**
 * Dynamically imported RichTextEditor component
 * 
 * This reduces the initial bundle size by ~150KB by lazy-loading
 * the TipTap editor and its extensions only when needed.
 * 
 * @example
 * ```tsx
 * import { RichTextEditorLazy } from '@/components/shared/form/lazy/RichTextEditorLazy';
 * 
 * <RichTextEditorLazy
 *   content={content}
 *   onChange={setContent}
 *   placeholder="Enter text..."
 * />
 * ```
 */
export const RichTextEditorLazy = dynamic<RichTextEditorProps>(
  () => import('../RichTextEditor').then((mod) => mod.RichTextEditor),
  {
    loading: ({ className, minHeight }: RichTextEditorProps) => (
      <RichTextEditorSkeleton className={className} minHeight={minHeight} />
    ),
    ssr: false, // Editor doesn't need SSR
  }
);
