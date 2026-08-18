import { useQuery } from "@tanstack/react-query";
import { authQueryKeys } from "../queries/auth.query-keys";
import { authApi } from "../api/auth.api";

export function useSession() {
  return useQuery({
    queryKey: authQueryKeys.session(),
    queryFn: authApi.getSession,
    retry: false,
  });
}
