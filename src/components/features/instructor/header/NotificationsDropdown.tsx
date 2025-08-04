'use client';

import { Bell } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

interface NotificationsDropdownProps {
  notifications?: Notification[];
}

export function NotificationsDropdown({
  notifications = [],
}: NotificationsDropdownProps) {
  const t = useTranslations();

  // Mock notifications - in real app, this would come from API
  const defaultNotifications: Notification[] = [
    {
      id: 1,
      title: t('instructor.notifications.newSubmission', {
        fallback: 'New quiz submission',
      }),
      message: t('instructor.notifications.submissionMessage', {
        fallback: 'Student completed Quiz #1',
      }),
      time: '5 min ago',
      unread: true,
    },
    {
      id: 2,
      title: t('instructor.notifications.lowScore', {
        fallback: 'Low score alert',
      }),
      message: t('instructor.notifications.lowScoreMessage', {
        fallback: 'Multiple students scored below 60%',
      }),
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      title: t('instructor.notifications.quizCompleted', {
        fallback: 'Quiz completed',
      }),
      message: t('instructor.notifications.quizCompletedMessage', {
        fallback: 'All students completed Quiz #2',
      }),
      time: '2 hours ago',
      unread: false,
    },
  ];

  const notificationList =
    notifications.length > 0 ? notifications : defaultNotifications;
  const unreadCount = notificationList.filter((n) => n.unread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">
            {t('instructor.notifications.title', {
              fallback: 'Notifications',
            })}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <h3 className="font-semibold">
            {t('instructor.notifications.title', {
              fallback: 'Notifications',
            })}
          </h3>
          {unreadCount > 0 && <Badge variant="secondary">{unreadCount}</Badge>}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-y-auto">
          {notificationList.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex-col items-start p-3"
            >
              <div className="flex w-full items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{notification.title}</p>
                    {notification.unread && (
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.time}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center">
          <span className="text-sm">
            {t('instructor.notifications.viewAll', {
              fallback: 'View all notifications',
            })}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
