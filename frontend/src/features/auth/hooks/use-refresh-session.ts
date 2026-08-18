import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { authQueryKeys } from "../queries/auth.query-keys";

export function useRefreshSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.refresh,

    onSuccess: (session) => {
      queryClient.setQueryData(authQueryKeys.session(), session);
    },
  });
}
