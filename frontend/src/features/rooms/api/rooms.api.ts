import { apiClient } from "@/shared/api/api-client";
import type {
  CreateRoomInput,
  JoinRoomInput,
  Page,
  Room,
  RoomSummary,
} from "../types/rooms.types";

export const roomsApi = {
  async createRoom(input: CreateRoomInput): Promise<Room> {
    const response = await apiClient.post<Room>("/api/rooms", input);

    return response.data;
  },

  async joinRoom(input: JoinRoomInput): Promise<Room> {
    const response = await apiClient.post<Room>("/api/rooms/join", input);

    return response.data;
  },

  async findRecentRooms(page = 0, size = 10): Promise<Page<RoomSummary>> {
    const response = await apiClient.get<Page<RoomSummary>>("/api/rooms", {
      params: { page, size },
    });

    return response.data;
  },
};
