'use client';

import * as React from 'react';

import Link from 'next/link';

import { cn } from '@/lib/utils';

export interface LogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
  showText?: boolean;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

const sizeClasses = {
  sm: {
    container: 'h-6 w-6',
    icon: 'h-3 w-3',
    text: 'text-sm',
  },
  md: {
    container: 'h-8 w-8',
    icon: 'h-4 w-4',
    text: 'text-base',
  },
  lg: {
    container: 'h-10 w-10',
    icon: 'h-5 w-5',
    text: 'text-lg',
  },
};

export function Logo({
  href = '/',
  size = 'md',
  variant: _variant = 'default',
  showText = true,
  className,
  iconClassName: _iconClassName,
  textClassName,
}: LogoProps) {
  const sizeConfig = sizeClasses[size];

  const logoContent = (
    <>
      {showText && (
        <span className={cn('font-bold', sizeConfig.text, textClassName)}>
          Quizify
        </span>
      )}
    </>
  );

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 transition-opacity hover:opacity-80',
        className
      )}
    >
      {logoContent}
    </Link>
  );
}

export default Logo;
