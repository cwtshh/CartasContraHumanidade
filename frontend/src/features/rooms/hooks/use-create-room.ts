import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roomsApi } from "../api/rooms.api";
import { roomsQueryKeys } from "../queries/rooms.query-keys";
import type { CreateRoomInput } from "../types/rooms.types";

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRoomInput) => roomsApi.createRoom(input),

    onSuccess: (room) => {
      queryClient.setQueryData(roomsQueryKeys.byCode(room.code), room);
      queryClient.invalidateQueries({ queryKey: roomsQueryKeys.all });
    },
  });
}
