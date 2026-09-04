import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { routePaths } from "@/app/router/route-paths";
import { PlayerPip } from "@/shared/components/player-pip";
import { useCurrentPlayer } from "@/shared/hooks/use-current-player";
import { MOCK_LOBBY_PLAYERS } from "../data/mock-rooms";
import { roomsQueryKeys } from "../queries/rooms.query-keys";
import { useRoomPresence } from "../hooks/use-room-presence";
import type { LobbyPlayer, Room } from "../types/rooms.types";

const DEFAULT_MAX_PLAYERS = 8;
const COUNTDOWN_SECONDS = 3;

export function LobbyPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const player = useCurrentPlayer();
  const [countdown, setCountdown] = useState<number | null>(null);

  useRoomPresence(code, player);

  const cachedRoom = useQuery<Room>({
    queryKey: roomsQueryKeys.byCode(code ?? ""),
    queryFn: () => Promise.reject(new Error("Room is only readable from cache")),
    enabled: false,
    retry: false,
  });

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      navigate(routePaths.game(code ?? ""));
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate, code]);

  if (!player) {
    return null;
  }

  const realRoom = code ? cachedRoom.data : undefined;

  const you: LobbyPlayer = {
    id: player.id,
    name: player.name,
    role: "HOST",
  };

  const maxPlayers = realRoom?.maxPlayers ?? DEFAULT_MAX_PLAYERS;
  const players: LobbyPlayer[] = realRoom
    ? realRoom.players.map((p) => ({
        id: p.id,
        name: p.displayName,
        role: p.role,
        connected: p.connected,
      }))
    : [you, ...MOCK_LOBBY_PLAYERS];
  const emptySlots = Math.max(maxPlayers - players.length, 0);

  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-14">
        <button
          type="button"
          onClick={() => navigate(routePaths.home)}
          className="mb-6 font-mono text-xs tracking-widest text-muted uppercase hover:text-foreground"
        >
          ← Sair da sala
        </button>

        <span className="mb-4 block font-mono text-xs text-muted uppercase">
          Pré-jogo
        </span>
        <h1 className="mb-2 text-5xl font-black tracking-tight text-foreground">
          Sala {code}
        </h1>
        <span className="font-mono text-xs text-muted">
          {players.length}/{maxPlayers} jogadores · 8 rodadas · 60s por turno
        </span>

        <div className="my-8 h-px bg-border" />

        <div className="mb-10 flex flex-col">
          {players.map((p) => (
            <div key={p.id}>
              <div
                className={`flex items-center gap-4 py-3.5 ${
                  p.connected === false ? "opacity-40" : ""
                }`}
              >
                <PlayerPip name={p.name} size={36} />
                <div className="flex-1">
                  <span className="font-medium text-foreground">
                    {p.name}
                    {p.name === you.name && (
                      <span className="ml-2 font-mono text-xs text-muted">
                        você
                      </span>
                    )}
                    {p.connected === false && (
                      <span className="ml-2 font-mono text-xs text-muted uppercase">
                        offline
                      </span>
                    )}
                  </span>
                </div>
                {p.role === "HOST" && (
                  <span className="bg-danger px-2.5 py-0.5 font-mono text-xs text-danger-foreground">
                    Host
                  </span>
                )}
              </div>
              <div className="h-px bg-border" />
            </div>
          ))}

          {Array.from({ length: emptySlots }).map((_, i) => (
            <div key={`empty-${i}`}>
              <div className="flex items-center gap-4 py-3.5 opacity-25">
                <div className="h-9 w-9 border border-dashed border-border" />
                <span className="font-mono text-xs text-muted">
                  Aguardando jogador...
                </span>
              </div>
              <div className="h-px bg-border" />
            </div>
          ))}
        </div>

        {countdown !== null ? (
          <div className="py-5 text-center">
            <div className="text-8xl font-black text-danger">{countdown}</div>
            <span className="mt-2 block font-mono text-xs text-muted uppercase">
              Iniciando...
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCountdown(COUNTDOWN_SECONDS)}
            className="w-full bg-foreground py-4 text-sm font-black tracking-widest text-background uppercase transition-colors hover:bg-danger hover:text-danger-foreground"
          >
            Iniciar partida
          </button>
        )}
      </div>
    </div>
  );
}
