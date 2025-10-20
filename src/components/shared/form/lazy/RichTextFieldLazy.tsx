'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import type { RichTextFieldProps } from '../RichTextField';
import type { FieldValues, FieldPath } from 'react-hook-form';

/**
 * Loading skeleton for RichTextField
 */
function RichTextFieldSkeleton<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ 
  label, 
  required,
  minHeight = '120px',
}: RichTextFieldProps<TFieldValues, TName>) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div
        className={cn(
          'border rounded-xl overflow-hidden bg-background'
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
    </div>
  );
}

/**
 * Dynamically imported RichTextField component
 * 
 * This reduces the initial bundle size by ~150KB by lazy-loading
 * the TipTap editor and its extensions only when needed.
 * 
 * @example
 * ```tsx
 * import { RichTextFieldLazy } from '@/components/shared/form/lazy/RichTextFieldLazy';
 * 
 * <RichTextFieldLazy
 *   control={control}
 *   name="content"
 *   label="Content"
 *   placeholder="Enter content..."
 * />
 * ```
 */
export const RichTextFieldLazy = dynamic(
  () => import('../RichTextField').then((mod) => mod.RichTextField),
  {
    loading: (props: any) => <RichTextFieldSkeleton {...props} />,
    ssr: false, // Editor doesn't need SSR
  }
) as <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: RichTextFieldProps<TFieldValues, TName>) => JSX.Element;
