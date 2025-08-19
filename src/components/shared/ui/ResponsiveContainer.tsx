'use client';

import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { useResponsive } from '../hooks/useResponsive';

export interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  centerContent?: boolean;
}

export function ResponsiveContainer({
  children,
  className,
  mobileClassName,
  tabletClassName,
  desktopClassName,
  maxWidth = '2xl',
  padding = 'md',
  centerContent = false,
}: ResponsiveContainerProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const maxWidthClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-none',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-2 py-2 sm:px-4 sm:py-4',
    md: 'px-4 py-4 sm:px-6 sm:py-6',
    lg: 'px-6 py-6 sm:px-8 sm:py-8',
  };

  return (
    <div
      className={cn(
        'w-full',
        maxWidth !== 'full' && 'mx-auto',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        centerContent && 'flex flex-col items-center',
        className,
        isMobile && mobileClassName,
        isTablet && tabletClassName,
        isDesktop && desktopClassName
      )}
    >
      {children}
    </div>
  );
}
