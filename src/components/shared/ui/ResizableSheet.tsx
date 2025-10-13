'use client';

import * as React from 'react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

// Helper function to get the current viewport height (keyboard-aware)
function getViewportHeight(): number {
  // Use visualViewport for keyboard-aware height on mobile
  if (typeof window !== 'undefined' && window.visualViewport) {
    return window.visualViewport.height;
  }
  return typeof window !== 'undefined' ? window.innerHeight : 0;
}

// Helper function to convert CSS height values to pixels
function parseHeightToPixels(height: string, viewportHeight: number): number {
  if (height.endsWith('vh')) {
    const value = parseFloat(height.replace('vh', ''));
    return (value / 100) * viewportHeight;
  }
  if (height.endsWith('%')) {
    const value = parseFloat(height.replace('%', ''));
    return (value / 100) * viewportHeight;
  }
  if (height.endsWith('px')) {
    return parseFloat(height.replace('px', ''));
  }
  // Fallback: try to parse as number (assume pixels)
  return parseFloat(height) || 0;
}

// Hook to handle drag-to-resize for bottom sheets
function useDragResize(
  enabled: boolean,
  snapPoints: string[] = ['50vh', '75vh', '90vh']
) {
  const [currentSnapIndex, setCurrentSnapIndex] = React.useState(
    snapPoints.length - 1
  );
  const [isDragging, setIsDragging] = React.useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = React.useState(false);
  const startY = React.useRef(0);
  const startHeight = React.useRef(0);
  const initialViewportHeight = React.useRef(0);

  // Detect keyboard open/close by monitoring visualViewport
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const handleResize = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;

      // If visualViewport height is significantly less than window height, keyboard is likely open
      const heightDiff = window.innerHeight - viewport.height;
      const keyboardOpen = heightDiff > 100; // threshold of 100px
      setIsKeyboardOpen(keyboardOpen);

      // Do NOT auto-shrink the sheet when the keyboard opens; keep the current height
      // and instead scroll the focused input into view from a separate effect.
      // This avoids unexpected sheet size changes on mobile.
      // (Intentionally left blank)
    };

    window.visualViewport.addEventListener('resize', handleResize);
    handleResize(); // Check initial state

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, [currentSnapIndex]);

  const handleDragStart = React.useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!enabled) return;

      // Don't allow dragging when keyboard is open or when focused on an input
      if (isKeyboardOpen) return;
      const activeElement = document.activeElement;
      if (
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.hasAttribute('contenteditable')
      ) {
        return;
      }

      setIsDragging(true);
      const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;
      startY.current = clientY;

      // Store initial viewport height to avoid recalculation during drag
      initialViewportHeight.current = getViewportHeight();

      // Calculate the actual pixel height of the current snap point
      const currentSnapPoint = snapPoints[currentSnapIndex] ?? snapPoints[0];
      startHeight.current = parseHeightToPixels(
        currentSnapPoint!,
        initialViewportHeight.current
      );
    },
    [enabled, currentSnapIndex, snapPoints, isKeyboardOpen]
  );

  const handleDragMove = React.useCallback(
    (e: TouchEvent | MouseEvent) => {
      if (!isDragging || !enabled) return;
      // Prevent background/page scroll while dragging on touch devices
      if ('cancelable' in e && (e as Event).cancelable) {
        e.preventDefault();
      }
      const clientY = 'touches' in e ? e.touches[0]?.clientY : (e as MouseEvent).clientY;
      if (!clientY) return;
      const deltaY = startY.current - clientY;

      // Use the stored viewport height to prevent flickering
      const viewportHeight = initialViewportHeight.current;
      const targetHeight = startHeight.current + deltaY;

      // Convert all snap points to pixels
      const snapHeightsInPixels = snapPoints.map((point) =>
        parseHeightToPixels(point, viewportHeight)
      );

      // Find closest snap point
      let closestIndex = 0;
      let minDiff = Math.abs(snapHeightsInPixels[0]! - targetHeight);

      snapHeightsInPixels.forEach((snapHeight, index) => {
        const diff = Math.abs(snapHeight - targetHeight);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = index;
        }
      });

      setCurrentSnapIndex(closestIndex);
    },
    [isDragging, enabled, snapPoints]
  );

  const handleDragEnd = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);

      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  return {
    currentHeight: snapPoints[currentSnapIndex],
    handleDragStart,
    isDragging,
    isKeyboardOpen,
  };
}

interface ResizableSheetContentProps
  extends Omit<React.ComponentProps<typeof SheetContent>, 'children'> {
  resizable?: boolean;
  snapPoints?: string[];
  children?: React.ReactNode;
}

function ResizableSheetContent({
  className,
  children,
  side = 'bottom',
  resizable = false,
  snapPoints = ['50vh', '75vh', '90vh'],
  ...props
}: ResizableSheetContentProps) {
  const { currentHeight, handleDragStart, isDragging, isKeyboardOpen } =
    useDragResize(resizable && side === 'bottom', snapPoints);
  const contentRef = React.useRef<HTMLDivElement>(null);
  // Capture a stable viewport height (ignores virtual keyboard)
  const stableViewportHeightRef = React.useRef<number>(0);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      stableViewportHeightRef.current = window.innerHeight;
    }
  }, []);

  // Lock background scroll while the sheet is mounted
  React.useEffect(() => {
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
  }, []);

  // Auto-scroll to focused element when keyboard opens
  React.useEffect(() => {
    if (!isKeyboardOpen || !contentRef.current) return;

    const activeElement = document.activeElement;
    if (
      activeElement &&
      (activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.hasAttribute('contenteditable'))
    ) {
      // Small delay to ensure keyboard animation is complete
      setTimeout(() => {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300);
    }
  }, [isKeyboardOpen]);

  const resolvedHeightPx = React.useMemo(() => {
    if (!(resizable && side === 'bottom')) return undefined;
    const base = stableViewportHeightRef.current || (typeof window !== 'undefined' ? window.innerHeight : 0);
    if (!currentHeight || !base) return undefined;
    return parseHeightToPixels(currentHeight, base);
  }, [currentHeight, resizable, side]);

  const heightStyle =
    resizable && side === 'bottom' && resolvedHeightPx
      ? { height: `${resolvedHeightPx}px`, maxHeight: `${resolvedHeightPx}px` }
      : {};

  return (
    <SheetContent
      ref={contentRef}
      side={side}
      className={cn(
        'overscroll-contain [scrollbar-gutter:stable_both-edges]',
        resizable &&
          side === 'bottom' &&
          'transition-all duration-300 ease-in-out',
        isDragging && 'duration-0',
        // Ensure close button is above drag handle; don't edit components/ui — override close button via descendant selector here
        side === 'bottom' && '[&_[data-slot=sheet-close]]:top-[44px]',
        side === 'bottom' && '[&_[data-slot=sheet-close]]:right-[max(env(safe-area-inset-right),0.75rem)]',
        side === 'bottom' && 'md:[&_[data-slot=sheet-close]]:right-[max(env(safe-area-inset-right),1rem)]',
        side === 'bottom' && '[&_[data-slot=sheet-close]]:z-50',
        className
      )}
      style={heightStyle}
      {...props}
    >
      {resizable && side === 'bottom' && (
        <div
          className="absolute top-0 left-0 right-0 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing z-50 touch-none"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          role="button"
          aria-label="Drag to resize"
          tabIndex={0}
        >
          <div className="w-16 h-1.5 bg-muted-foreground/40 rounded-full hover:bg-muted-foreground/60 transition-colors" />
        </div>
      )}
      {children}
    </SheetContent>
  );
}

interface ResizableSheetHeaderProps
  extends Omit<React.ComponentProps<typeof SheetHeader>, 'children'> {
  hasResizeHandle?: boolean;
  children?: React.ReactNode;
}

function ResizableSheetHeader({
  className,
  hasResizeHandle = false,
  ...props
}: ResizableSheetHeaderProps) {
  return (
    <SheetHeader
      className={cn(
        'sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b',
        hasResizeHandle && 'pt-10',
        className
      )}
      {...props}
    />
  );
}

type ResizableSheetTitleProps = React.ComponentProps<typeof SheetTitle>;

function ResizableSheetTitle({
  className,
  ...props
}: ResizableSheetTitleProps) {
  return <SheetTitle className={cn('text-lg', className)} {...props} />;
}

export {
  Sheet as ResizableSheet,
  ResizableSheetContent,
  ResizableSheetHeader,
  ResizableSheetTitle,
};
