import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useSession } from "@/features/auth";
import { routePaths } from "@/app/router/route-paths";
import { MOCK_ROOMS } from "../data/mock-rooms";
import type { RoomListItem } from "../types/rooms.types";

type RoomFilter = "all" | "waiting";

const filterIndicatorTransition = {
  type: "spring",
  stiffness: 500,
  damping: 35,
} as const;

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

export function RoomsPage() {
  const navigate = useNavigate();
  const session = useSession();
  const [rooms, setRooms] = useState<RoomListItem[]>(MOCK_ROOMS);
  const [filter, setFilter] = useState<RoomFilter>("all");

  if (!session.data) {
    return null;
  }

  const shown = rooms.filter(
    (room) => filter === "all" || room.status === "WAITING",
  );

  function handleCreate() {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const newRoom: RoomListItem = {
      id: code,
      code,
      name: `Sala de ${session.data!.displayName}`,
      status: "WAITING",
      playerCount: 1,
      maxPlayers: 8,
      locked: false,
    };
    setRooms((prev) => [newRoom, ...prev]);
    navigate(routePaths.room(code));
  }

  function handleJoin(room: RoomListItem) {
    if (room.status !== "WAITING") return;
    navigate(routePaths.room(room.code));
  }

  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mb-8 flex items-end justify-between"
        >
          <div>
            <span className="mb-2.5 block font-mono text-xs tracking-widest text-muted uppercase">
              Bem-vindo, {session.data.displayName}
            </span>
            <h1 className="text-5xl font-black tracking-tight text-foreground">
              Salas
            </h1>
          </div>
          <motion.button
            type="button"
            onClick={handleCreate}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="bg-danger px-6 py-3 text-sm font-black tracking-widest text-danger-foreground uppercase"
          >
            + Criar sala
          </motion.button>
        </motion.div>

        <div className="relative mb-6 flex border-b border-border">
          {(["all", "waiting"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`relative -mb-px px-5 pt-2 pb-3 font-mono text-xs tracking-widest uppercase transition-colors ${
                filter === f
                  ? "text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {f === "all" ? "Todas" : "Abertas"}
              {filter === f && (
                <motion.span
                  layoutId="rooms-filter-indicator"
                  transition={filterIndicatorTransition}
                  className="absolute right-0 -bottom-px left-0 h-0.5 bg-foreground"
                />
              )}
            </button>
          ))}
        </div>

        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col"
        >
          <AnimatePresence initial={false}>
            {shown.map((room, i) => {
              const isOpen = room.status === "WAITING";
              return (
                <motion.div
                  key={room.id}
                  layout
                  variants={itemVariants}
                  exit="exit"
                >
                  <div
                    role={isOpen ? "button" : undefined}
                    tabIndex={isOpen ? 0 : undefined}
                    onClick={() => handleJoin(room)}
                    className={`flex items-center justify-between py-5 transition-opacity ${
                      isOpen ? "cursor-pointer hover:opacity-70" : ""
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <span className="min-w-6 font-mono text-xs text-muted">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl font-black text-foreground">
                            {room.name}
                          </span>
                          {room.locked && (
                            <span className="font-mono text-xs text-muted">
                              🔒
                            </span>
                          )}
                        </div>
                        <span
                          className={`mt-1 block font-mono text-xs uppercase ${
                            isOpen ? "text-success" : "text-muted"
                          }`}
                        >
                          {isOpen ? "Aberta" : "Em andamento"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="font-mono text-xs text-muted">
                        {room.playerCount}
                        <span className="text-border">/{room.maxPlayers}</span>
                      </span>
                      {isOpen && (
                        <span className="bg-foreground px-4 py-1.5 font-mono text-xs tracking-widest text-background">
                          Entrar →
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-px bg-border" />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {shown.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center font-mono text-xs text-muted uppercase"
            >
              Nenhuma sala encontrada
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
