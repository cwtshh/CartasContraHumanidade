import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { authQueryKeys } from "../queries/auth.query-keys";

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.signOut,

    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: authQueryKeys.session(),
        exact: true,
      });
    },
  });
}
