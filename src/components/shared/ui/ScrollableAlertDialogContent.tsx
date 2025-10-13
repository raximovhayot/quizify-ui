import * as React from 'react';

import { cn } from '@/lib/utils';
import { AlertDialogContent } from '@/components/ui/alert-dialog';

/**
 * ScrollableAlertDialogContent
 *
 * Wrapper around `AlertDialogContent` that keeps the close area static
 * (note: AlertDialog often has no X) while making the inner body scrollable.
 * The scrollbar appears INSIDE the dialog border.
 */
export interface ScrollableAlertDialogContentProps
  extends React.ComponentProps<typeof AlertDialogContent> {
  bodyClassName?: string;
}

export function ScrollableAlertDialogContent({
  className,
  bodyClassName,
  children,
  ...props
}: Readonly<ScrollableAlertDialogContentProps>) {
  return (
    <AlertDialogContent className={cn(className)} {...props}>
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
    </AlertDialogContent>
  );
}

export default ScrollableAlertDialogContent;
