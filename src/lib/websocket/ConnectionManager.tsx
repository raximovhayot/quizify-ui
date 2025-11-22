'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { wsClient } from './client';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ConnectionManager component handles WebSocket lifecycle
 * Features:
 * - Auto-connect on login with user credentials
 * - Connection status indicator
 * - Auto-reconnect with exponential backoff
 * - Heartbeat monitoring
 */
export function ConnectionManager() {
  const { data: session, status } = useSession();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Auto-connect when user is authenticated
      const userId = (session.user as { id?: number }).id;
      const accessToken = (session as { accessToken?: string }).accessToken;

      if (userId && accessToken) {
        setConnectionStatus('connecting');
        wsClient.connect(userId, accessToken);

        // Check connection status periodically
        const checkInterval = setInterval(() => {
          const isConnected = wsClient.isConnected();
          if (isConnected) {
            setConnectionStatus('connected');
            setReconnectAttempts(0);
          } else {
            setConnectionStatus('disconnected');
            // Attempt reconnect with exponential backoff
            if (reconnectAttempts < 5) {
              const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
              setTimeout(() => {
                wsClient.connect(userId, accessToken);
                setReconnectAttempts(prev => prev + 1);
              }, delay);
            }
          }
        }, 5000); // Check every 5 seconds

        return () => {
          clearInterval(checkInterval);
        };
      }
    } else if (status === 'unauthenticated') {
      // Disconnect when user logs out
      wsClient.disconnect();
      setConnectionStatus('disconnected');
      setReconnectAttempts(0);
    }
  }, [status, session, reconnectAttempts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsClient.disconnect();
    };
  }, []);

  // Don't render anything if not authenticated
  if (status !== 'authenticated') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm shadow-lg transition-all',
          connectionStatus === 'connected' && 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
          connectionStatus === 'connecting' && 'border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
          connectionStatus === 'disconnected' && 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
        )}
      >
        {connectionStatus === 'connected' ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4 animate-pulse" />
        )}
        <span className="font-medium">
          {connectionStatus === 'connected' && 'Connected'}
          {connectionStatus === 'connecting' && 'Connecting...'}
          {connectionStatus === 'disconnected' && `Disconnected${reconnectAttempts > 0 ? ` (Retry ${reconnectAttempts}/5)` : ''}`}
        </span>
      </div>
    </div>
  );
}
