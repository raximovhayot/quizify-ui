'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TopLoaderProps {
  color?: string;
  height?: number;
  showSpinner?: boolean;
  speed?: number;
  className?: string;
  isLoading?: boolean;
}

export function TopLoader({
  color = 'hsl(var(--primary))',
  height = 3,
  showSpinner = true,
  speed = 200,
  className,
  isLoading = false
}: TopLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    
    if (isLoading) {
      setProgress(0);
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, speed);
    } else {
      setProgress(100);
      setTimeout(() => setProgress(0), 200);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isLoading, speed]);

  if (!isLoading && progress === 0) return null;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-opacity duration-200',
        className
      )}
      style={{ height: `${height}px` }}
    >
      <div
        className="h-full transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}, 0 0 5px ${color}`,
        }}
      />
      {showSpinner && isLoading && (
        <div
          className="absolute right-2 top-1/2 -translate-y-1/2"
          style={{ marginTop: `${height / 2}px` }}
        >
          <div
            className="animate-spin rounded-full border-2 border-transparent"
            style={{
              width: '16px',
              height: '16px',
              borderTopColor: color,
              borderRightColor: color,
            }}
          />
        </div>
      )}
    </div>
  );
}

// Hook to manually control the top loader
export function useTopLoader() {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  return {
    isLoading,
    startLoading,
    stopLoading,
  };
}

// Context for global loading state
import { createContext, useContext, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      <TopLoader />
    </LoadingContext.Provider>
  );
}

export function useGlobalLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useGlobalLoading must be used within a LoadingProvider');
  }
  return context;
}