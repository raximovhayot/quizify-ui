import { useCallback } from 'react';
import { wsClient, type WebSocketMessage } from './client';

/**
 * React hook for WebSocket integration
 * 
 * Usage:
 * ```tsx
 * const { subscribe, isConnected } = useWebSocket();
 * 
 * useEffect(() => {
 *   const unsubscribe = subscribe((message) => {
 *     console.log('Received:', message);
 *   });
 *   return unsubscribe;
 * }, [subscribe]);
 * ```
 */
export const useWebSocket = () => {
  // Note: This version doesn't auto-connect.
  // You need to call wsClient.connect() manually when you have user ID and token
  // Or integrate with your auth system to auto-connect
  
  const subscribe = useCallback((callback: (msg: WebSocketMessage) => void) => {
    const id = Math.random().toString(36).substring(7);
    wsClient.onMessage(id, callback);
    
    return () => wsClient.offMessage(id);
  }, []);
  
  const connect = useCallback((userId: number, accessToken: string) => {
    wsClient.connect(userId, accessToken);
  }, []);
  
  const disconnect = useCallback(() => {
    wsClient.disconnect();
  }, []);
  
  return { 
    subscribe, 
    connect,
    disconnect,
    isConnected: wsClient.isConnected() 
  };
};
