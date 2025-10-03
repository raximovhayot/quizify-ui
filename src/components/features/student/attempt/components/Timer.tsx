'use client';

import { useEffect, useState } from 'react';

import { Clock } from 'lucide-react';

import { useTranslations } from 'next-intl';

interface TimerProps {
  timeRemaining: number; // in seconds
  onTimeUp: () => void;
}

export function Timer({ timeRemaining: initialTime, onTimeUp }: TimerProps) {
  const t = useTranslations();
  const [timeRemaining, setTimeRemaining] = useState(initialTime);

  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, onTimeUp]);

  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  const isLowTime = timeRemaining < 300; // Less than 5 minutes

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
        isLowTime ? 'bg-destructive/10 text-destructive' : 'bg-muted'
      }`}
    >
      <Clock className="h-4 w-4" />
      <span className="font-mono font-semibold">
        {hours > 0 && `${hours}:`}
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      {isLowTime && (
        <span className="text-xs ml-2">
          {t('student.attempt.timeRunningOut', { fallback: 'Time running out!' })}
        </span>
      )}
    </div>
  );
}
