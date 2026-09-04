import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roomsApi } from "../api/rooms.api";
import { roomsQueryKeys } from "../queries/rooms.query-keys";

export function useLeaveRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => roomsApi.leaveRoom(code),

    onSuccess: (_data, code) => {
      queryClient.removeQueries({ queryKey: roomsQueryKeys.byCode(code) });
      queryClient.invalidateQueries({ queryKey: roomsQueryKeys.all });
    },
  });
}
