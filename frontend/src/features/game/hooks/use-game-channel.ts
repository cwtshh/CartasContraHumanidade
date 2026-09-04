import { useEffect, useRef, useState } from "react";
import { createRoomSocketClient } from "@/features/rooms/lib/room-socket";
import type { CurrentPlayer } from "@/shared/hooks/use-current-player";
import type { GamePrivateState, GamePublicState } from "../types/game.types";

type GameAction = "start" | "submit" | "choose-winner" | "next-round";

export function useGameChannel(
  code: string | undefined,
  player: CurrentPlayer | null,
  myRoomPlayerId: string | undefined,
  initialPublicState: GamePublicState | null = null,
  initialPrivateState: GamePrivateState | null = null,
) {
  const [publicState, setPublicState] = useState<GamePublicState | null>(
    initialPublicState,
  );
  const [privateState, setPrivateState] = useState<GamePrivateState | null>(
    initialPrivateState,
  );
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<ReturnType<typeof createRoomSocketClient> | null>(
    null,
  );

  useEffect(() => {
    if (!code || !player) return;

    const connectHeaders: Record<string, string> = player.isGuest
      ? { "X-Guest-Id": player.id, "X-Guest-Name": player.name }
      : {};

    const client = createRoomSocketClient(connectHeaders);
    clientRef.current = client;

    client.onConnect = () => {
      client.subscribe(`/topic/rooms/${code}/game`, (message) => {
        setPublicState(JSON.parse(message.body) as GamePublicState);
      });

      if (myRoomPlayerId) {
        client.subscribe(
          `/topic/rooms/${code}/game/hand/${myRoomPlayerId}`,
          (message) => {
            setPrivateState(JSON.parse(message.body) as GamePrivateState);
          },
        );
      }

      client.subscribe(`/topic/rooms/${code}/game/error`, (message) => {
        setError(message.body);
      });

      client.publish({ destination: `/app/rooms/${code}/enter` });
    };

    client.activate();

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [code, player, myRoomPlayerId]);

  function send(action: GameAction, body?: unknown) {
    if (!code) return;

    clientRef.current?.publish({
      destination: `/app/rooms/${code}/game/${action}`,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  return {
    publicState,
    privateState,
    error,
    startGame: () => send("start"),
    submitCards: (cardIds: string[]) => send("submit", { cardIds }),
    chooseWinner: (winningSubmissionId: string) =>
      send("choose-winner", { winningSubmissionId }),
    nextRound: () => send("next-round"),
  };
}
