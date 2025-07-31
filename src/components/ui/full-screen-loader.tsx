'use client';

import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

interface FullScreenLoaderProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FullScreenLoader({ 
  text, 
  size = 'md' 
}: FullScreenLoaderProps) {

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 
          className={`${sizeClasses[size]} animate-spin text-primary`} 
        />
        {text && (
          <p className={`${textSizeClasses[size]} text-muted-foreground animate-pulse`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

// Convenience component with default loading text
export function FullScreenLoaderWithText({ 
  text, 
  size = 'md' 
}: FullScreenLoaderProps) {
  const t = useTranslations('common');
  
  return (
    <FullScreenLoader 
      text={text || t('loading', { default: 'Loading...' })} 
      size={size} 
    />
  );
}