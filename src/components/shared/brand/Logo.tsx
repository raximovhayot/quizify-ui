'use client';

import { BookOpen } from 'lucide-react';

import * as React from 'react';

import { useTranslations } from 'next-intl';
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
  variant = 'default',
  showText = true,
  className,
  iconClassName,
  textClassName,
}: LogoProps) {
  const t = useTranslations();
  const sizeConfig = sizeClasses[size];

  const logoContent = (
    <>
      <div
        className={cn(
          'flex items-center justify-center rounded-lg bg-primary text-primary-foreground',
          sizeConfig.container,
          iconClassName
        )}
      >
        <BookOpen className={cn(sizeConfig.icon)} />
      </div>
      {showText && variant === 'default' && (
        <span
          className={cn(
            'font-bold',
            sizeConfig.text,
            'hidden sm:inline-block',
            textClassName
          )}
        >
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
