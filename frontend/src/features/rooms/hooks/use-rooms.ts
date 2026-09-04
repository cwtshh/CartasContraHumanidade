import { useQuery } from "@tanstack/react-query";
import { roomsApi } from "../api/rooms.api";
import { roomsQueryKeys } from "../queries/rooms.query-keys";

export function useRooms(page = 0, size = 10) {
  return useQuery({
    queryKey: roomsQueryKeys.list(page, size),
    queryFn: () => roomsApi.findRecentRooms(page, size),
  });
}
