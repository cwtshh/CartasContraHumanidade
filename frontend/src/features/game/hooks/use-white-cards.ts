import { useQuery } from "@tanstack/react-query";
import { cardsApi } from "../api/cards.api";

export function useWhiteCards(ids: string[]) {
  const key = [...ids].sort().join(",");

  return useQuery({
    queryKey: ["white-cards", key],
    queryFn: () => cardsApi.findWhiteCards(ids),
    enabled: ids.length > 0,
    staleTime: Infinity,
  });
}
