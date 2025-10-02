'use client';

import * as React from 'react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

// Hook to handle drag-to-resize for bottom sheets
function useDragResize(
  enabled: boolean,
  snapPoints: string[] = ['50vh', '75vh', '90vh']
) {
  const [currentSnapIndex, setCurrentSnapIndex] = React.useState(
    snapPoints.length - 1
  );
  const [isDragging, setIsDragging] = React.useState(false);
  const startY = React.useRef(0);
  const startHeight = React.useRef(0);

  const handleDragStart = React.useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!enabled) return;
      setIsDragging(true);
      const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
      startY.current = clientY;
      startHeight.current =
        window.innerHeight * (currentSnapIndex / (snapPoints.length - 1));
    },
    [enabled, currentSnapIndex, snapPoints.length]
  );

  const handleDragMove = React.useCallback(
    (e: TouchEvent | MouseEvent) => {
      if (!isDragging || !enabled) return;
      const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
      if (!clientY) return;
      const deltaY = startY.current - clientY;

      // Calculate which snap point we're closest to
      const viewportHeight = window.innerHeight;
      const targetHeight = startHeight.current + deltaY;
      const targetPercentage = (targetHeight / viewportHeight) * 100;

      // Find closest snap point
      const snapPercentages = snapPoints.map((point) =>
        parseInt(point.replace('vh', ''), 10)
      );
      let closestIndex = 0;
      let minDiff = Math.abs(snapPercentages[0]! - targetPercentage);

      snapPercentages.forEach((snap, index) => {
        const diff = Math.abs(snap - targetPercentage);
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
      window.addEventListener('touchmove', handleDragMove);
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
  const { currentHeight, handleDragStart, isDragging } = useDragResize(
    resizable && side === 'bottom',
    snapPoints
  );

  const heightStyle =
    resizable && side === 'bottom'
      ? { height: currentHeight, maxHeight: currentHeight }
      : {};

  return (
    <SheetContent
      side={side}
      className={cn(
        resizable && side === 'bottom' && 'transition-all ease-in-out',
        isDragging && 'duration-0',
        className
      )}
      style={heightStyle}
      {...props}
    >
      {resizable && side === 'bottom' && (
        <div
          className="absolute top-0 left-0 right-0 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing z-10 touch-none"
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

interface ResizableSheetHeaderProps extends Omit<React.ComponentProps<typeof SheetHeader>, 'children'> {
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
      className={cn(hasResizeHandle && 'pt-10', className)}
      {...props}
    />
  );
}

export {
  Sheet as ResizableSheet,
  ResizableSheetContent,
  ResizableSheetHeader,
  SheetTitle as ResizableSheetTitle,
};
