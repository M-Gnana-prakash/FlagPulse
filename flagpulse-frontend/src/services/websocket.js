import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:8083/ws';

export function connectWebSocket(onFlagUpdate, onConnectionChange) {
  try {
    stompClient = new Client({
      webSocketFactory: () => new SockJS(WEBSOCKET_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        if (onConnectionChange) onConnectionChange(true);
        stompClient.subscribe('/topic/flag-updates', (message) => {
          try {
            const body = JSON.parse(message.body);
            if (onFlagUpdate) onFlagUpdate(body);
          } catch (e) {
            console.error('Failed to parse WebSocket message', e);
          }
        });
      },
      onDisconnect: () => {
        if (onConnectionChange) onConnectionChange(false);
      },
      onStompError: (frame) => {
        console.warn('STOMP broker error:', frame.headers['message']);
        if (onConnectionChange) onConnectionChange(false);
      }
    });

    stompClient.activate();
  } catch (err) {
    console.warn('WebSocket connection failed:', err);
    if (onConnectionChange) onConnectionChange(false);
  }
}

export function disconnectWebSocket() {
  if (stompClient) {
    stompClient.deactivate();
  }
}
