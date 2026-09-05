import { useQuery } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import { profileQueryKeys } from "../queries/profile.query-keys";

export function usePrejudiceStats() {
  return useQuery({
    queryKey: profileQueryKeys.prejudiceStats(),
    queryFn: () => profileApi.getPrejudiceStats(),
  });
}
