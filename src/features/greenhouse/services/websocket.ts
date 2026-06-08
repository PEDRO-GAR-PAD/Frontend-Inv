// src/features/greenhouse/services/websocket.ts
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export function connectWebSocket(
  invernaderoId: string | number, // <-- RECIBIR EL ID
  onMessage: (data: any) => void
) {
  const socket = new SockJS(`${API_BASE_URL}/ws-invernadero`);

  const client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000
  });

  client.onConnect = () => {
    console.log("WebSocket conectado al invernadero:", invernaderoId);

    // Suscribirse al canal dinámico (Asegúrate de que coincida con el de tu Backend)
    client.subscribe(`/topic/invernadero/${invernaderoId}`, (message) => {
      const payload = JSON.parse(message.body);
      onMessage(payload);
    });
  };

  client.activate();

  return () => {
    client.deactivate();
  };
}