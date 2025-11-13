import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

export interface WebSocketMessage {
  attemptId: number;
  action: 'STOP' | 'WARNING';
  message: string;
  data?: unknown;
}

type MessageCallback = (message: WebSocketMessage) => void;

class WebSocketClient {
  private client: Client | null = null;
  private callbacks: Map<string, MessageCallback> = new Map();
  private userId: number | null = null;
  private connected = false;

  connect(userId: number, accessToken: string) {
    if (this.connected && this.userId === userId) {
      return; // Already connected
    }

    this.disconnect(); // Disconnect previous connection
    this.userId = userId;

    // eslint-disable-next-line no-process-env
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws';
    const socket = new SockJS(wsUrl);
    
    this.client = new Client({
      webSocketFactory: () => socket as WebSocket,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      debug: (str) => {
        // eslint-disable-next-line no-process-env
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log('[WebSocket]', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      // eslint-disable-next-line no-console
      console.log('[WebSocket] Connected');
      this.connected = true;
      this.subscribe();
    };

    this.client.onStompError = (frame) => {
      // eslint-disable-next-line no-console
      console.error('[WebSocket] Error:', frame);
      this.connected = false;
    };

    this.client.onDisconnect = () => {
      // eslint-disable-next-line no-console
      console.log('[WebSocket] Disconnected');
      this.connected = false;
    };

    this.client.activate();
  }

  private subscribe() {
    if (!this.client || !this.userId) return;

    this.client.subscribe(`/queue/attempt/${this.userId}`, (message: IMessage) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.body);
        this.callbacks.forEach((callback) => callback(data));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[WebSocket] Failed to parse message:', error);
      }
    });
  }

  onMessage(id: string, callback: MessageCallback) {
    this.callbacks.set(id, callback);
  }

  offMessage(id: string) {
    this.callbacks.delete(id);
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.callbacks.clear();
    this.connected = false;
    this.userId = null;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const wsClient = new WebSocketClient();
