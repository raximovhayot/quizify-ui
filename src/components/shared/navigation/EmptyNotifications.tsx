'use client';

import { Bell, Sparkles } from 'lucide-react';

import { useTranslations } from 'next-intl';

export function EmptyNotifications() {
  const t = useTranslations();
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
      <div className="relative">
        <div
          className="absolute inset-0 animate-ping rounded-full bg-primary/10"
          aria-hidden="true"
        />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-transparent border border-border">
          <Bell className="h-5 w-5 text-primary" aria-hidden="true" />
          <Sparkles
            className="absolute -right-1 -top-1 h-4 w-4 text-yellow-500 drop-shadow"
            aria-hidden="true"
          />
        </div>
      </div>
      <p className="text-sm font-medium text-foreground">
        {t('notifications.empty.title', { fallback: 'No notifications' })}
      </p>
      <p className="text-xs">
        {t('notifications.empty.description', {
          fallback: "You're all caught up",
        })}
      </p>
    </div>
  );
}

export default EmptyNotifications;
