'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from '@/lib/websocket/hooks';
import { toast } from 'sonner';
import { Bell, AlertTriangle, XCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// Local minimal type for websocket messages to avoid importing non-exported types
// and to satisfy linting rules
type IncomingMessage = {
  action: 'STOP' | 'WARNING' | 'INFO';
  message: string;
  attemptId?: number;
};

interface Notification {
  id: string;
  type: 'STOP' | 'WARNING' | 'INFO';
  message: string;
  timestamp: Date;
  read: boolean;
  attemptId?: number;
}

interface LiveNotificationsProps {
  enableSoundAlerts?: boolean;
  maxHistorySize?: number;
}

/**
 * LiveNotifications component handles real-time WebSocket notifications
 * Features:
 * - Toast notifications for WebSocket events
 * - Sound alerts (optional)
 * - Notification history with timestamps
 * - Mark as read functionality
 * - Visual indicators for unread notifications
 */
export function LiveNotifications({ 
  enableSoundAlerts = false,
  maxHistorySize = 50
}: LiveNotificationsProps) {
  const { subscribe } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Play sound alert
  const playSound = useCallback((type: 'warning' | 'error') => {
    if (!enableSoundAlerts) return;
    
    try {
      // Create simple beep sound
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = type === 'error' ? 400 : 600;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      // Silently fail - sound is optional
    }
  }, [enableSoundAlerts]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    const unsubscribe = subscribe((message: IncomingMessage) => {
      const notification: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        type: message.action,
        message: message.message,
        timestamp: new Date(),
        read: false,
        attemptId: message.attemptId,
      };

      // Add to history
      setNotifications(prev => {
        const updated = [notification, ...prev];
        // Limit history size
        return updated.slice(0, maxHistorySize);
      });

      // Show toast notification
      if (message.action === 'STOP') {
        toast.error(message.message, {
          icon: <XCircle className="h-5 w-5" />,
          duration: 5000,
        });
        playSound('error');
      } else if (message.action === 'WARNING') {
        toast.warning(message.message, {
          icon: <AlertTriangle className="h-5 w-5" />,
          duration: 4000,
        });
        playSound('warning');
      } else {
        toast.info(message.message, {
          icon: <Bell className="h-5 w-5" />,
          duration: 3000,
        });
      }
    });

    return unsubscribe;
  }, [subscribe, maxHistorySize, playSound]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const clearHistory = () => {
    setNotifications([]);
    setShowHistory(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'STOP':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'WARNING':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setShowHistory(!showHistory)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification History Dropdown */}
      {showHistory && (
        <Card className="absolute right-0 top-12 z-50 w-96 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-8 text-xs"
                >
                  <Check className="mr-1 h-3 w-3" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="h-8 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors',
                        !notification.read && 'bg-blue-50 dark:bg-blue-900/10'
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium leading-none">
                              {notification.message}
                            </p>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {notification.type}
                            </Badge>
                            <span>
                              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                            </span>
                          </div>
                          {notification.attemptId && (
                            <p className="text-xs text-muted-foreground">
                              Attempt ID: {notification.attemptId}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
