import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Chip, Separator, Skeleton, toast } from "@heroui/react";
import { routePaths } from "@/app/router/route-paths";
import { useCurrentPlayer } from "@/shared/hooks/use-current-player";
import { PlayerPip } from "@/shared/components/player-pip";
import { roomsQueryKeys, useLeaveRoom, type Room } from "@/features/rooms";
import { useGameChannel } from "../hooks/use-game-channel";
import { useWhiteCards } from "../hooks/use-white-cards";
import { PlayingCard } from "../components/playing-card";
import type { GamePhase, GamePrivateState, GamePublicState } from "../types/game.types";

type GameNavigationState = {
  publicState?: GamePublicState;
  privateState?: GamePrivateState;
};

const CONFETTI = [
  { angle: -70, color: "bg-danger" },
  { angle: -45, color: "bg-warning" },
  { angle: -20, color: "bg-accent" },
  { angle: 0, color: "bg-danger" },
  { angle: 20, color: "bg-accent" },
  { angle: 45, color: "bg-warning" },
  { angle: 70, color: "bg-danger" },
  { angle: 110, color: "bg-accent" },
  { angle: -110, color: "bg-warning" },
  { angle: 180, color: "bg-danger" },
];

function phaseLabel(phase: GamePhase) {
  if (phase === "SUBMITTING") return "Enviando cartas";
  if (phase === "JUDGING") return "Julgamento";
  if (phase === "FINISHED") return "Fim de jogo";
  return "Resultado";
}

const MEDALS = ["🥇", "🥈", "🥉"] as const;
const PODIUM_HEIGHTS = ["h-28 bg-warning", "h-20 bg-default", "h-14 bg-danger/60"];
const PODIUM_ORDER = [1, 0, 2];

export function GamePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const player = useCurrentPlayer();
  const leaveRoom = useLeaveRoom();

  const navState = (location.state ?? {}) as GameNavigationState;

  const room = useQuery<Room>({
    queryKey: roomsQueryKeys.byCode(code ?? ""),
    queryFn: () => Promise.reject(new Error("Room is only readable from cache")),
    enabled: false,
    retry: false,
  }).data;

  const myRoomPlayerId = room?.players.find(
    (p) => p.displayName === player?.name,
  )?.id;

  const {
    publicState,
    privateState,
    error,
    submitCards,
    chooseWinner,
    nextRound,
  } = useGameChannel(
      code,
      player,
      myRoomPlayerId,
      navState.publicState ?? null,
      navState.privateState ?? null,
    );

  useEffect(() => {
    if (error) toast.danger(error);
  }, [error]);

  const [selectedHandIds, setSelectedHandIds] = useState<Set<string>>(new Set());
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(
    null,
  );

  const allCardIds = useMemo(() => {
    const ids = new Set<string>(privateState?.myHand ?? []);
    publicState?.submissions.forEach((s) => s.cardIds.forEach((id) => ids.add(id)));
    return [...ids];
  }, [privateState, publicState]);

  const whiteCards = useWhiteCards(allCardIds);

  function cardText(id: string) {
    return whiteCards.data?.find((c) => c.id === id)?.text ?? "...";
  }

  function nameFor(roomPlayerId: string | null) {
    if (!roomPlayerId) return "Alguém";
    return room?.players.find((p) => p.id === roomPlayerId)?.displayName ?? "Jogador";
  }

  if (!player || !publicState) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background">
        <p className="font-mono text-xs text-muted uppercase">
          Carregando partida...
        </p>
      </div>
    );
  }

  const isCzar = publicState.czarPlayerId === myRoomPlayerId;
  const isHost =
    room?.players.find((p) => p.id === myRoomPlayerId)?.role === "HOST";
  const pick = publicState.blackCard.pick;
  const hasSubmitted = privateState?.hasSubmitted ?? false;

  function toggleHandCard(id: string) {
    setSelectedHandIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
        return next;
      }

      if (next.size >= pick) {
        return prev;
      }

      next.add(id);
      return next;
    });
  }

  function renderHandCard(id: string, index = 0) {
    const isSelected = selectedHandIds.has(id);
    const isBlocked = !isSelected && selectedHandIds.size >= pick;
    return (
      <PlayingCard
        key={id}
        index={index}
        interactive
        selected={isSelected}
        disabled={isBlocked}
        onClick={() => toggleHandCard(id)}
      >
        {whiteCards.isPending ? <Skeleton className="h-4 w-24" /> : cardText(id)}
      </PlayingCard>
    );
  }

  function handleSubmit() {
    submitCards([...selectedHandIds]);
    setSelectedHandIds(new Set());
  }

  function handleChooseWinner() {
    if (!selectedSubmissionId) return;
    chooseWinner(selectedSubmissionId);
    setSelectedSubmissionId(null);
  }

  return (
    <div className="text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (code) leaveRoom.mutate(code);
              navigate(routePaths.home);
            }}
            className="font-mono text-xs tracking-widest text-muted uppercase transition-colors hover:text-foreground"
          >
            ← Sair da partida
          </button>
          <div className="flex items-center gap-2">
            {publicState.phase !== "FINISHED" && (
              <Chip>Rodada {publicState.roundNumber}</Chip>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={publicState.phase}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
              >
                <Chip color={publicState.phase === "JUDGING" ? "warning" : "default"}>
                  {phaseLabel(publicState.phase)}
                </Chip>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>


        {publicState.phase !== "FINISHED" && (
          <>
            <div className="mb-6 flex justify-center">
              <div className="w-full max-w-55">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={publicState.blackCard.id}
                    initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  >
                    <PlayingCard variant="black" footer={`Escolha ${pick}`}>
                      {publicState.blackCard.text}
                    </PlayingCard>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {publicState.scores.map((s, i) => (
                <motion.div
                  key={s.roomPlayerId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                >
                  <Chip
                    color={s.roomPlayerId === publicState.czarPlayerId ? "danger" : "default"}
                  >
                    {nameFor(s.roomPlayerId)}
                    {s.roomPlayerId === myRoomPlayerId ? " (você)" : ""} · {s.score}
                    {s.roomPlayerId === publicState.czarPlayerId ? " · Juiz" : ""}
                  </Chip>
                </motion.div>
              ))}
            </div>

            <Separator className="mb-6" />
          </>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={publicState.phase}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {publicState.phase === "SUBMITTING" &&
              (isCzar ? (
                <div className="py-8 text-center">
                  <p className="font-medium text-foreground">
                    Você é o juiz nessa rodada.
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted">
                    Aguardando cartas · {publicState.totalSubmissions}/
                    {publicState.expectedSubmissions}
                  </p>
                </div>
              ) : hasSubmitted ? (
                <div className="py-8 text-center">
                  <p className="font-medium text-foreground">
                    Cartas enviadas! Aguardando os outros jogadores...
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted">
                    {publicState.totalSubmissions}/{publicState.expectedSubmissions}
                  </p>
                </div>
              ) : (
                <div>
                  <span className="mb-3 block font-mono text-xs tracking-widest text-muted uppercase">
                    Sua mão
                  </span>

                  <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-12 pb-3 sm:hidden">
                    {(privateState?.myHand ?? []).map((id, i) => (
                      <div key={id} className="w-56 shrink-0 snap-center">
                        {renderHandCard(id, i)}
                      </div>
                    ))}
                  </div>

                  <div className="hidden sm:relative sm:left-1/2 sm:flex sm:w-screen sm:max-w-5xl sm:-translate-x-1/2 sm:items-end sm:justify-center sm:gap-3 sm:overflow-x-auto sm:px-8 sm:py-6">
                    {(privateState?.myHand ?? []).map((id, i, hand) => {
                      const center = (hand.length - 1) / 2;
                      const offset = i - center;
                      const rotate = offset * 3;
                      const lift = Math.abs(offset) * 5;
                      return (
                        <div
                          key={id}
                          className="w-32 shrink-0 transition-transform duration-200 hover:z-10 hover:-translate-y-1"
                          style={{
                            transform: `rotate(${rotate}deg) translateY(${lift}px)`,
                            transformOrigin: "bottom center",
                          }}
                        >
                          {renderHandCard(id, i)}
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    type="button"
                    className="mt-6 w-full"
                    isDisabled={selectedHandIds.size !== pick}
                    onClick={handleSubmit}
                  >
                    Enviar cartas ({selectedHandIds.size}/{pick})
                  </Button>
                </div>
              ))}

            {publicState.phase === "JUDGING" &&
              (isCzar ? (
                <div>
                  <span className="mb-3 block font-mono text-xs tracking-widest text-muted uppercase">
                    Escolha a melhor resposta
                  </span>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {publicState.submissions.map((s, i) => (
                      <PlayingCard
                        key={s.submissionId}
                        index={i}
                        interactive
                        selected={selectedSubmissionId === s.submissionId}
                        onClick={() => setSelectedSubmissionId(s.submissionId)}
                      >
                        {s.cardIds.map(cardText).join(" + ")}
                      </PlayingCard>
                    ))}
                  </div>

                  <Button
                    type="button"
                    className="mt-6 w-full"
                    isDisabled={!selectedSubmissionId}
                    onClick={handleChooseWinner}
                  >
                    Escolher vencedor
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="mb-4 text-center font-medium text-foreground">
                    O juiz está escolhendo a melhor resposta...
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {publicState.submissions.map((s, i) => (
                      <PlayingCard key={s.submissionId} index={i}>
                        {s.cardIds.map(cardText).join(" + ")}
                      </PlayingCard>
                    ))}
                  </div>
                </div>
              ))}

            {publicState.phase === "REVEALING_WINNER" && (
              <div className="relative">
                <div className="pointer-events-none absolute inset-x-0 top-0 flex h-0 justify-center">
                  {CONFETTI.map((c, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                      animate={{
                        opacity: 0,
                        x: Math.cos((c.angle * Math.PI) / 180) * 110,
                        y: Math.sin((c.angle * Math.PI) / 180) * 110 - 30,
                        scale: 0.3,
                      }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className={`absolute h-2 w-2 rounded-full ${c.color}`}
                    />
                  ))}
                </div>

                <motion.p
                  initial={{ opacity: 0, scale: 0.7, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 16 }}
                  className="mb-4 text-center font-display text-2xl font-bold text-foreground"
                >
                  🎉 {nameFor(publicState.winningPlayerId)} venceu a rodada!
                </motion.p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {publicState.submissions.map((s, i) => (
                    <PlayingCard
                      key={s.submissionId}
                      index={i}
                      highlighted={s.roomPlayerId === publicState.winningPlayerId}
                      footer={nameFor(s.roomPlayerId)}
                    >
                      {s.cardIds.map(cardText).join(" + ")}
                    </PlayingCard>
                  ))}
                </div>

                {isHost ? (
                  <Button type="button" className="mt-6 w-full" onClick={nextRound}>
                    Próxima rodada
                  </Button>
                ) : (
                  <p className="mt-6 text-center font-mono text-xs text-muted uppercase">
                    Aguardando o host iniciar a próxima rodada...
                  </p>
                )}
              </div>
            )}

            {publicState.phase === "FINISHED" &&
              (() => {
                const ranked = [...publicState.scores].sort((a, b) => b.score - a.score);
                const podium = ranked.slice(0, 3);
                const rest = ranked.slice(3);

                return (
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-x-0 top-0 flex h-0 justify-center">
                      {CONFETTI.map((c, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                          animate={{
                            opacity: 0,
                            x: Math.cos((c.angle * Math.PI) / 180) * 140,
                            y: Math.sin((c.angle * Math.PI) / 180) * 140 - 30,
                            scale: 0.3,
                          }}
                          transition={{ duration: 1.1, ease: "easeOut" }}
                          className={`absolute h-2 w-2 rounded-full ${c.color}`}
                        />
                      ))}
                    </div>

                    <motion.p
                      initial={{ opacity: 0, scale: 0.7, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 16 }}
                      className="mb-8 text-center font-display text-3xl font-bold text-foreground"
                    >
                      🏆 Fim de jogo!
                    </motion.p>

                    <div className="mb-8 flex items-end justify-center gap-3">
                      {PODIUM_ORDER.map((podiumIndex, i) => {
                        const entry = podium[podiumIndex];
                        if (!entry) return null;

                        return (
                          <motion.div
                            key={entry.roomPlayerId}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: i * 0.15,
                              type: "spring",
                              stiffness: 260,
                              damping: 22,
                            }}
                            className="flex flex-col items-center"
                          >
                            <span className="mb-2 text-3xl">{MEDALS[podiumIndex]}</span>
                            <PlayerPip name={nameFor(entry.roomPlayerId)} size={44} />
                            <span className="mt-2 font-display text-sm font-bold text-foreground">
                              {nameFor(entry.roomPlayerId)}
                              {entry.roomPlayerId === myRoomPlayerId ? " (você)" : ""}
                            </span>
                            <span className="font-mono text-xs text-muted">
                              {entry.score} pts
                            </span>
                            <div
                              className={`mt-3 w-20 rounded-t-lg ${PODIUM_HEIGHTS[podiumIndex]}`}
                            />
                          </motion.div>
                        );
                      })}
                    </div>

                    {rest.length > 0 && (
                      <div className="mx-auto mb-8 flex max-w-xs flex-col gap-2">
                        {rest.map((entry, i) => (
                          <div
                            key={entry.roomPlayerId}
                            className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-2"
                          >
                            <span className="font-mono text-xs text-muted">{i + 4}º</span>
                            <span className="flex-1 px-3 font-medium text-foreground">
                              {nameFor(entry.roomPlayerId)}
                              {entry.roomPlayerId === myRoomPlayerId ? " (você)" : ""}
                            </span>
                            <span className="font-mono text-xs text-muted">
                              {entry.score} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => {
                        if (code) leaveRoom.mutate(code);
                        navigate(routePaths.home);
                      }}
                    >
                      Voltar para as salas
                    </Button>
                  </div>
                );
              })()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
