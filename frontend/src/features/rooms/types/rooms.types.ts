export type RoomStatus = "WAITING" | "IN_PROGRESS";

export type RoomListItem = {
  id: string;
  code: string;
  name: string;
  status: RoomStatus;
  playerCount: number;
  maxPlayers: number;
  locked: boolean;
};

export type PlayerRole = "HOST" | "PLAYER";

export type LobbyPlayer = {
  id: string;
  name: string;
  role: PlayerRole;
};
