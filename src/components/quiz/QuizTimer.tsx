'use client';

import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizTimerProps {
  endTime: Date;
  onTimeExpired?: () => void;
  className?: string;
}

/**
 * QuizTimer component displays a countdown timer for quiz attempts
 * Features:
 * - Displays time in HH:MM:SS format
 * - Visual warnings: yellow when < 5 minutes, red when < 1 minute
 * - Calls onTimeExpired callback when time runs out
 */
export function QuizTimer({ endTime, onTimeExpired, className }: QuizTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    const calculateRemaining = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const remaining = Math.max(0, Math.floor((end - now) / 1000));
      return remaining;
    };

    // Initial calculation
    setTimeRemaining(calculateRemaining());

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onTimeExpired?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onTimeExpired]);

  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine warning level
  const getWarningLevel = (): 'normal' | 'warning' | 'critical' => {
    if (timeRemaining <= 60) return 'critical'; // < 1 minute
    if (timeRemaining <= 300) return 'warning'; // < 5 minutes
    return 'normal';
  };

  const warningLevel = getWarningLevel();

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-lg font-semibold transition-colors',
        warningLevel === 'critical' && 'bg-destructive/10 text-destructive',
        warningLevel === 'warning' && 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500',
        warningLevel === 'normal' && 'bg-muted text-muted-foreground',
        className
      )}
    >
      {warningLevel === 'critical' ? (
        <AlertTriangle className="h-5 w-5 animate-pulse" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
      <span>{formatTime(timeRemaining)}</span>
    </div>
  );
}
