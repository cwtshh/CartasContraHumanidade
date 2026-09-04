import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { routePaths } from "@/app/router/route-paths";
import { ApiError } from "@/shared/api/api-error";
import { useCurrentPlayer } from "@/shared/hooks/use-current-player";
import { useCreateRoom } from "../hooks/use-create-room";
import { useJoinRoom } from "../hooks/use-join-room";
import { useRooms } from "../hooks/use-rooms";
import { Button, Card, Input, Label, TextField } from "@heroui/react";

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const PLAYER_LIMIT_OPTIONS = [4, 6, 8, 10, 12] as const;
const TARGET_SCORE_OPTIONS = [5, 7, 10, 15] as const;

export function RoomsPage() {
  const navigate = useNavigate();
  const player = useCurrentPlayer();
  const rooms = useRooms();

  const [isCreating, setIsCreating] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState<number>(8);
  const [targetScore, setTargetScore] = useState<number>(7);

  const createRoom = useCreateRoom();
  const joinRoom = useJoinRoom();

  if (!player) {
    return null;
  }

  function openCreateForm() {
    createRoom.reset();
    setRoomName(`Sala de ${player!.name}`);
    setMaxPlayers(8);
    setTargetScore(7);
    setIsCreating(true);
  }

  function closeCreateForm() {
    setIsCreating(false);
    createRoom.reset();
  }

  function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = roomName.trim();
    if (!trimmedName) return;

    createRoom.mutate(
      {
        name: trimmedName,
        maxPlayers,
        targetScore,
        guestDisplayName: player!.isGuest ? player!.name : undefined,
      },
      {
        onSuccess: (room) => {
          navigate(routePaths.room(room.code));
        },
      },
    );
  }

  function handleJoin(code: string) {
    joinRoom.mutate(
      {
        code,
        guestDisplayName: player!.isGuest ? player!.name : undefined,
      },
      {
        onSuccess: (room) => {
          navigate(routePaths.room(room.code));
        },
      },
    );
  }

  const createErrorMessage =
    createRoom.error instanceof ApiError
      ? createRoom.error.message
      : createRoom.isError
        ? "Não foi possível criar a sala. Tente novamente."
        : null;

  const joinErrorMessage =
    joinRoom.error instanceof ApiError
      ? joinRoom.error.message
      : joinRoom.isError
        ? "Não foi possível entrar na sala. Tente novamente."
        : null;

  const roomList = rooms.data?.content ?? [];

  return (
    <div className="text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mb-8 flex items-end justify-between"
        >
          <div>
            <span className="mb-2.5 block font-mono text-xs tracking-widest text-muted uppercase">
              Bem-vindo, {player.name}
            </span>
            <h1 className="font-display text-5xl font-bold tracking-tight text-foreground">
              Salas
            </h1>
          </div>
          <Button
            type="button"
            onClick={openCreateForm}
            isDisabled={isCreating}
          >
            + Criar sala
          </Button>
        </motion.div>

        <AnimatePresence initial={false}>
          {isCreating && (
            <motion.form
              onSubmit={handleCreateSubmit}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mb-8 overflow-hidden"
            >
              <Card className="flex flex-col gap-4 p-5">
                <TextField
                  fullWidth
                  isRequired
                  isDisabled={createRoom.isPending}
                  validationBehavior="aria"
                  autoFocus
                >
                  <Label>Nome da sala</Label>
                  <Input
                    name="roomName"
                    placeholder="Amigos do Rafinha"
                    value={roomName}
                    onChange={(event) => setRoomName(event.target.value)}
                  />
                </TextField>

                <div>
                  <span className="mb-2 block font-mono text-xs tracking-widest text-muted uppercase">
                    Máximo de jogadores
                  </span>
                  <div className="flex gap-2">
                    {PLAYER_LIMIT_OPTIONS.map((limit) => (
                      <button
                        key={limit}
                        type="button"
                        disabled={createRoom.isPending}
                        onClick={() => setMaxPlayers(limit)}
                        className={`px-3.5 py-2 font-mono text-xs transition-colors ${
                          maxPlayers === limit
                            ? "bg-foreground text-background"
                            : "bg-transparent text-muted hover:text-foreground"
                        }`}
                      >
                        {limit}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="mb-2 block font-mono text-xs tracking-widest text-muted uppercase">
                    Pontos para vencer
                  </span>
                  <div className="flex gap-2">
                    {TARGET_SCORE_OPTIONS.map((score) => (
                      <button
                        key={score}
                        type="button"
                        disabled={createRoom.isPending}
                        onClick={() => setTargetScore(score)}
                        className={`px-3.5 py-2 font-mono text-xs transition-colors ${
                          targetScore === score
                            ? "bg-foreground text-background"
                            : "bg-transparent text-muted hover:text-foreground"
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                {createErrorMessage && (
                  <p
                    role="alert"
                    className="rounded-xl bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger-soft-foreground"
                  >
                    {createErrorMessage}
                  </p>
                )}

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    onClick={closeCreateForm}
                    isDisabled={createRoom.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" isDisabled={createRoom.isPending}>
                    {createRoom.isPending ? "Criando..." : "Criar sala"}
                  </Button>
                </div>
              </Card>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mb-6 flex items-center justify-between border-b border-border pb-3">
          <span className="font-mono text-xs tracking-widest text-muted uppercase">
            {roomList.length} salas abertas
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={() => rooms.refetch()}
            isDisabled={rooms.isFetching}
          >
            {rooms.isFetching ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>

        {joinErrorMessage && (
          <p
            role="alert"
            className="mb-6 rounded-xl bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger-soft-foreground"
          >
            {joinErrorMessage}
          </p>
        )}

        {rooms.isPending && (
          <p className="py-12 text-center font-mono text-xs text-muted uppercase">
            Carregando salas...
          </p>
        )}

        {rooms.isError && (
          <p className="py-12 text-center font-mono text-xs text-muted uppercase">
            Não foi possível carregar as salas.
          </p>
        )}

        {rooms.isSuccess && (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-2"
          >
            <AnimatePresence initial={false}>
              {roomList.map((room, i) => {
                const isFull = room.currentPlayers >= room.maxPlayers;
                return (
                  <motion.div
                    key={room.id}
                    layout
                    variants={itemVariants}
                    exit="exit"
                    whileHover={isFull ? undefined : { y: -2 }}
                    role={isFull ? undefined : "button"}
                    tabIndex={isFull ? undefined : 0}
                    onClick={() =>
                      !isFull && !joinRoom.isPending && handleJoin(room.code)
                    }
                    className={`flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 transition-colors ${
                      isFull
                        ? "opacity-50"
                        : "cursor-pointer hover:border-danger/50"
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <span className="min-w-6 font-mono text-xs text-muted">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <span className="font-display text-xl font-bold text-foreground">
                          {room.name}
                        </span>
                        <span className="mt-1 flex items-center gap-1.5 font-mono text-xs text-muted uppercase">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isFull ? "bg-muted" : "bg-success"
                            }`}
                          />
                          {isFull ? "Cheia" : "Aberta"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="font-mono text-xs text-muted">
                        {room.currentPlayers}
                        <span className="text-border">
                          /{room.maxPlayers}
                        </span>
                      </span>
                      {!isFull && (
                        <Button onClick={() => handleJoin(room.code)}>
                          Entrar
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {roomList.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center font-mono text-xs text-muted uppercase"
              >
                Nenhuma sala aberta agora
              </motion.p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
