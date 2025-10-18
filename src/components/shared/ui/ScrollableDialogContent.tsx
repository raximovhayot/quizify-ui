'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { DialogContent } from '@/components/ui/dialog';

/**
 * ScrollableDialogContent
 *
 * Wrapper around `DialogContent` that keeps the close (X) button static
 * while making the inner body scrollable. The scrollbar appears INSIDE the
 * dialog border as requested.
 *
 * Guidelines:
 * - Do not modify primitives in `src/components/ui/*`. Use this wrapper instead.
 */
export interface ScrollableDialogContentProps
  extends React.ComponentProps<typeof DialogContent> {
  /**
   * Extra className for the scrollable body container.
   */
  bodyClassName?: string;
}

export function ScrollableDialogContent({
  className,
  bodyClassName,
  children,
  ...props
}: Readonly<ScrollableDialogContentProps>): React.JSX.Element {
  const t = useTranslations('common.formDrawer');
  const contentDomId = React.useId();

  // Compute default aria-describedby; allow override via props
  const ariaDescribedByProp = (props as { ['aria-describedby']?: string })['aria-describedby'];
  const describedById = ariaDescribedByProp ?? `${contentDomId}-desc`;

  return (
    <DialogContent
      // Keep close (X) static; make inner body scrollable. Use an edge-to-edge scroll container
      // so the scrollbar hugs the right border.
      className={cn(className)}
      {...props}
      aria-describedby={describedById}
    >
      <div className="-m-6 rounded-[inherit]">
        <div
          className={cn(
            'max-h-[calc(100svh-2rem)] sm:max-h-[85vh] overflow-y-auto overscroll-contain min-h-0 rounded-[inherit] [scrollbar-gutter:stable]',
            bodyClassName
          )}
        >
          <div className="p-6">{children}</div>
        </div>
      </div>
      {!ariaDescribedByProp && (
        <span id={`${contentDomId}-desc`} className="sr-only">
          {t('description', { fallback: 'Dialog content and actions' })}
        </span>
      )}
    </DialogContent>
  );
}

export default ScrollableDialogContent;
