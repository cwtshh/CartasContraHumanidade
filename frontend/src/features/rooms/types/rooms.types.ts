export type RoomStatus = "WAITING" | "IN_PROGRESS" | "FINISHED";

export type PlayerRole = "HOST" | "PLAYER";

export type LobbyPlayer = {
  id: string;
  name: string;
  role: PlayerRole;
  connected?: boolean;
};

export type RoomMember = {
  id: string;
  displayName: string;
  role: PlayerRole;
  connected: boolean;
  guest: boolean;
};

export type Room = {
  id: string;
  code: string;
  name: string;
  status: RoomStatus;
  maxPlayers: number;
  targetScore: number;
  players: RoomMember[];
};

export type CreateRoomInput = {
  name: string;
  maxPlayers?: number;
  targetScore?: number;
  guestDisplayName?: string;
};

export type JoinRoomInput = {
  code: string;
  guestDisplayName?: string;
};

export type RoomSummary = {
  id: string;
  code: string;
  name: string;
  status: RoomStatus;
  maxPlayers: number;
  currentPlayers: number;
  createdAt: string;
};

export type Page<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};
