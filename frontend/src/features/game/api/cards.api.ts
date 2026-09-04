import { apiClient } from "@/shared/api/api-client";
import type { WhiteCard } from "../types/game.types";

export const cardsApi = {
  async findWhiteCards(ids: string[]): Promise<WhiteCard[]> {
    if (ids.length === 0) {
      return [];
    }

    const response = await apiClient.get<WhiteCard[]>("/api/cards/white", {
      params: { ids: ids.join(",") },
    });

    return response.data;
  },
};
