'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface IFormDrawerContentProps
  extends Omit<React.ComponentProps<typeof SheetContent>, 'children'> {
  open?: boolean; // controls background scroll lock
  lockBackgroundScroll?: boolean; // default true
  children?: React.ReactNode;
}

// Keyboard-aware: scroll focused inputs into view when mobile keyboard opens
function useKeyboardScrollIntoView(): void {
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const onResize = () => {
      // Debounce with rAF to avoid jank
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const activeElement = document.activeElement as HTMLElement | null;
        if (
          activeElement &&
          (activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.hasAttribute('contenteditable'))
        ) {
          // Give the keyboard time to settle
          setTimeout(() => {
            try {
              activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch {}
          }, 250);
        }
      });
    };

    window.visualViewport.addEventListener('resize', onResize);
    return () => {
      window.visualViewport?.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);
}

function FormDrawerContent({
  className,
  children,
  side = 'bottom',
  open,
  lockBackgroundScroll = true,
  ...props
}: IFormDrawerContentProps): React.JSX.Element {
  const t = useTranslations('common.formDrawer');
  const contentRef = React.useRef<HTMLDivElement>(null);
  const contentDomId = React.useId();

  useKeyboardScrollIntoView();

  // Compute default aria-describedby; allow override via props
  const ariaDescribedByProp = (props as any)?.['aria-describedby'] as string | undefined;
  const describedById = ariaDescribedByProp ?? `${contentDomId}-desc`;

  // Lock background scroll only while the drawer is OPEN (and if enabled)
  React.useEffect(() => {
    if (!lockBackgroundScroll || !open) return;
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const bodyStyle = body.style as CSSStyleDeclaration;
    const prevBodyOverscroll = bodyStyle.overscrollBehavior;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    bodyStyle.overscrollBehavior = 'contain';

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      bodyStyle.overscrollBehavior = prevBodyOverscroll;
    };
  }, [lockBackgroundScroll, open]);

  return (
    <SheetContent
      ref={contentRef}
      id={contentDomId}
      side={side}
      // Full-height, mobile-first layout
      className={cn(
        'p-0 h-[100dvh] max-h-[100dvh] flex flex-col rounded-t-2xl',
        'overscroll-contain [scrollbar-gutter:stable_both-edges]',
        // Ensure close button is well placed; do not edit components/ui — override via descendant selector
        side === 'bottom' && '[&_[data-slot=sheet-close]]:top-[44px]',
        side === 'bottom' && '[&_[data-slot=sheet-close]]:right-[max(env(safe-area-inset-right),0.75rem)]',
        side === 'bottom' && 'md:[&_[data-slot=sheet-close]]:right-[max(env(safe-area-inset-right),1rem)]',
        side === 'bottom' && '[&_[data-slot=sheet-close]]:z-50',
        className
      )}
      aria-label={t('label', { fallback: 'Form drawer' })}
      {...props}
      aria-describedby={describedById}
    >
      {children}
      {!ariaDescribedByProp && (
        <span id={`${contentDomId}-desc`} className="sr-only">
          {t('description', { fallback: 'Form actions and fields' })}
        </span>
      )}
    </SheetContent>
  );
}

interface IFormDrawerHeaderProps
  extends Omit<React.ComponentProps<typeof SheetHeader>, 'children'> {
  children?: React.ReactNode;
}

function FormDrawerHeader({ className, ...props }: IFormDrawerHeaderProps): React.JSX.Element {
  return (
    <SheetHeader
      className={cn(
        'sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b',
        'px-4 pt-4 pb-3',
        className
      )}
      {...props}
    />
  );
}

type TFormDrawerTitleProps = React.ComponentProps<typeof SheetTitle>;

function FormDrawerTitle({ className, ...props }: TFormDrawerTitleProps): React.JSX.Element {
  return <SheetTitle className={cn('text-lg', className)} {...props} />;
}

type TFormDrawerDescriptionProps = React.ComponentProps<typeof SheetDescription>;

function FormDrawerDescription({ className, ...props }: TFormDrawerDescriptionProps): React.JSX.Element {
  return (
    <SheetDescription className={cn('text-sm text-muted-foreground', className)} {...props} />
  );
}

interface IFormDrawerBodyProps {
  className?: string;
  children?: React.ReactNode;
}

function FormDrawerBody({ className, children }: IFormDrawerBodyProps): React.JSX.Element {
  // Scrollable area for form content
  return (
    <div className={cn('flex-1 overflow-y-auto px-4 pb-safe', className)}>
      {children}
    </div>
  );
}

interface IFormDrawerFooterProps {
  className?: string;
  children?: React.ReactNode;
}

function FormDrawerFooter({ className, children }: IFormDrawerFooterProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t',
        'px-4 py-3 pb-safe',
        className
      )}
    >
      {children}
    </div>
  );
}

export {
  Sheet as FormDrawer,
  FormDrawerContent,
  FormDrawerHeader,
  FormDrawerTitle,
  FormDrawerDescription,
  FormDrawerBody,
  FormDrawerFooter,
};
