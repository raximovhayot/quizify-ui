'use client';

import { useCallback } from 'react';

import { cn } from '@/lib/utils';

export interface SkipToContentProps {
  targetId: string;
  children?: React.ReactNode;
  className?: string;
}

export function SkipToContent({
  targetId,
  children = 'Skip to main content',
  className,
}: SkipToContentProps) {
  const handleSkip = useCallback(
    (e: React.KeyboardEvent | React.MouseEvent) => {
      e.preventDefault();
      const target = document.getElementById(targetId);

      if (target) {
        // Make target focusable temporarily if it's not
        const originalTabIndex = target.getAttribute('tabindex');
        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
        }

        target.focus();

        // Scroll to target
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });

        // Restore original tabindex after focus
        setTimeout(() => {
          if (originalTabIndex) {
            target.setAttribute('tabindex', originalTabIndex);
          } else {
            target.removeAttribute('tabindex');
          }
        }, 100);
      }
    },
    [targetId]
  );

  return (
    <a
      href={`#${targetId}`}
      onClick={handleSkip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleSkip(e);
        }
      }}
      className={cn(
        // Hidden by default, visible when focused
        'sr-only focus:not-sr-only',
        'fixed top-4 left-4 z-50',
        'bg-primary text-primary-foreground',
        'px-4 py-2 rounded-md',
        'text-sm font-medium',
        'transition-all duration-200',
        'focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'hover:bg-primary/90',
        className
      )}
    >
      {children}
    </a>
  );
}
