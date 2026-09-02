import type { LobbyPlayer, RoomListItem } from "../types/rooms.types";

export const MOCK_ROOMS: RoomListItem[] = [
  {
    id: "1",
    code: "RAF123",
    name: "Amigos do Rafinha",
    status: "WAITING",
    playerCount: 4,
    maxPlayers: 8,
    locked: false,
  },
  {
    id: "2",
    code: "NOI456",
    name: "Noite de sexta",
    status: "WAITING",
    playerCount: 6,
    maxPlayers: 8,
    locked: true,
  },
  {
    id: "3",
    code: "TRA789",
    name: "Trabalho tóxico",
    status: "IN_PROGRESS",
    playerCount: 8,
    maxPlayers: 8,
    locked: false,
  },
  {
    id: "4",
    code: "FAM321",
    name: "Família em crise",
    status: "WAITING",
    playerCount: 2,
    maxPlayers: 6,
    locked: false,
  },
];

export const MOCK_LOBBY_PLAYERS: LobbyPlayer[] = [
  { id: "p2", name: "Bia Nunes", role: "PLAYER" },
  { id: "p3", name: "Théo Farias", role: "PLAYER" },
  { id: "p4", name: "Cacá Lemos", role: "PLAYER" },
];
