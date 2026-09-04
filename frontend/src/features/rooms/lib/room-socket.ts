import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { env } from "@/shared/config/env";

export function createRoomSocketClient(connectHeaders: Record<string, string> = {}) {
  return new Client({
    webSocketFactory: () => new SockJS(`${env.apiUrl}/ws`),
    reconnectDelay: 3000,
    connectHeaders,
  });
}
