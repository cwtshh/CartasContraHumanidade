import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roomsApi } from "../api/rooms.api";
import { roomsQueryKeys } from "../queries/rooms.query-keys";
import type { JoinRoomInput } from "../types/rooms.types";

export function useJoinRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: JoinRoomInput) => roomsApi.joinRoom(input),

    onSuccess: (room) => {
      queryClient.setQueryData(roomsQueryKeys.byCode(room.code), room);
      queryClient.invalidateQueries({ queryKey: roomsQueryKeys.all });
    },
  });
}
