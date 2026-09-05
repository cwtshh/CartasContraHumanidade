import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { routePaths } from "@/app/router/route-paths";
import { PlayerPip } from "@/shared/components/player-pip";
import { useCurrentPlayer } from "@/shared/hooks/use-current-player";
import { useGameChannel } from "@/features/game";
import { MOCK_LOBBY_PLAYERS } from "../data/mock-rooms";
import { roomsQueryKeys } from "../queries/rooms.query-keys";
import { useRoomPresence } from "../hooks/use-room-presence";
import { useLeaveRoom } from "../hooks/use-leave-room";
import type { LobbyPlayer, Room } from "../types/rooms.types";
import { Button, toast } from "@heroui/react";

const DEFAULT_MAX_PLAYERS = 8;
const DEFAULT_TARGET_SCORE = 7;
const COUNTDOWN_SECONDS = 3;
const MIN_PLAYERS = 3;
const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function LobbyPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const player = useCurrentPlayer();
  const [countdown, setCountdown] = useState<number | null>(null);

  useRoomPresence(code, player);
  const leaveRoom = useLeaveRoom();

  const cachedRoom = useQuery<Room>({
    queryKey: roomsQueryKeys.byCode(code ?? ""),
    queryFn: () =>
      Promise.reject(new Error("Room is only readable from cache")),
    enabled: false,
    retry: false,
  });

  const realRoom = code ? cachedRoom.data : undefined;
  const myRoomPlayerId = realRoom?.players.find(
    (p) => p.displayName === player?.name,
  )?.id;

  const gameChannel = useGameChannel(
    realRoom ? code : undefined,
    player,
    myRoomPlayerId,
  );

  useEffect(() => {
    if (gameChannel.error) toast.danger(gameChannel.error);
  }, [gameChannel.error]);

  useEffect(() => {
    if (gameChannel.publicState && gameChannel.privateState) {
      navigate(routePaths.game(code ?? ""), {
        state: {
          publicState: gameChannel.publicState,
          privateState: gameChannel.privateState,
        },
      });
    }
  }, [gameChannel.publicState, gameChannel.privateState, navigate, code]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      if (realRoom) {
        gameChannel.startGame();
        const resetTimer = setTimeout(() => setCountdown(null), 0);
        return () => clearTimeout(resetTimer);
      }
      navigate(routePaths.game(code ?? ""));
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, navigate, code, realRoom]);

  if (!player) {
    return null;
  }

  const you: LobbyPlayer = {
    id: player.id,
    name: player.name,
    role: "HOST",
  };

  const maxPlayers = realRoom?.maxPlayers ?? DEFAULT_MAX_PLAYERS;
  const targetScore = realRoom?.targetScore ?? DEFAULT_TARGET_SCORE;
  const players: LobbyPlayer[] = realRoom
    ? realRoom.players.map((p) => ({
        id: p.id,
        name: p.displayName,
        role: p.role,
        connected: p.connected,
      }))
    : [you, ...MOCK_LOBBY_PLAYERS];
  const emptySlots = Math.max(maxPlayers - players.length, 0);

  const me = players.find((p) => p.name === player.name);
  const isHost = me?.role === "HOST";
  const notEnoughPlayers = players.length < MIN_PLAYERS;

  return (
    <div className="text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-14">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Button
            type="button"
            onClick={() => {
              if (code) leaveRoom.mutate(code);
              navigate(routePaths.home);
            }}
          >
            Sair da Sala
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3, ease: "easeOut" }}
        >
          <span className="mt-8 mb-2 block font-mono text-xs text-muted uppercase">
            Pré-jogo
          </span>
          <h1 className="mb-2 font-display text-5xl font-bold tracking-tight text-foreground">
            Sala <span className="text-danger">{code}</span>
          </h1>
          <span className="font-mono text-xs text-muted">
            {players.length}/{maxPlayers} jogadores · primeiro a {targetScore} pontos
            vence
          </span>
        </motion.div>

        <div className="my-8 h-px bg-border" />

        <div className="mb-10 flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {players.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.22, delay: i * 0.04, ease: "easeOut" }}
                className="flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3"
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
                  </span>
                </div>
                {p.role === "HOST" && (
                  <span className="rounded-full bg-danger px-2.5 py-0.5 font-mono text-xs text-danger-foreground">
                    Host
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {Array.from({ length: emptySlots }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center gap-4 rounded-xl border border-dashed border-border px-4 py-3 opacity-30"
            >
              <div className="h-9 w-9 rounded-full border border-dashed border-border" />
              <span className="font-mono text-xs text-muted">
                Aguardando jogador...
              </span>
            </div>
          ))}
        </div>


        {countdown !== null ? (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="relative h-32 w-32">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="8"
                />
                <motion.circle
                  key={countdown}
                  cx="60"
                  cy="60"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="var(--danger)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: RING_CIRCUMFERENCE }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </svg>
              <motion.div
                key={`num-${countdown}`}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="absolute inset-0 flex items-center justify-center font-display text-5xl font-bold text-danger"
              >
                {countdown}
              </motion.div>
            </div>
            <span className="mt-3 block font-mono text-xs text-muted uppercase">
              Iniciando...
            </span>
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full"
              onClick={() => setCountdown(null)}
            >
              Cancelar
            </Button>
          </div>
        ) : isHost ? (
          <>
            <Button
              type="button"
              onClick={() => setCountdown(COUNTDOWN_SECONDS)}
              className="w-full"
              isDisabled={notEnoughPlayers}
            >
              Iniciar partida
            </Button>
            {notEnoughPlayers && (
              <p className="mt-2 text-center font-mono text-xs text-muted uppercase">
                Mínimo de {MIN_PLAYERS} jogadores para iniciar
              </p>
            )}
          </>
        ) : (
          <p className="text-center font-mono text-xs text-muted uppercase">
            Aguardando o host iniciar a partida...
          </p>
        )}
      </div>
    </div>
  );
}
