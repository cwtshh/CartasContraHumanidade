import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { CurrentPlayer } from "@/shared/hooks/use-current-player";
import { createRoomSocketClient } from "../lib/room-socket";
import { roomsQueryKeys } from "../queries/rooms.query-keys";
import type { Room } from "../types/rooms.types";

export function useRoomPresence(
  code: string | undefined,
  player: CurrentPlayer | null,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!code || !player) return;

    const connectHeaders: Record<string, string> = player.isGuest
      ? { "X-Guest-Id": player.id, "X-Guest-Name": player.name }
      : {};

    const client = createRoomSocketClient(connectHeaders);

    client.onConnect = () => {
      client.subscribe(`/topic/rooms/${code}`, (message) => {
        const room = JSON.parse(message.body) as Room;

        queryClient.setQueryData(roomsQueryKeys.byCode(code), room);
      });

      client.publish({ destination: `/app/rooms/${code}/enter` });
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [code, player, queryClient]);
}
