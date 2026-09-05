import { apiClient } from "@/shared/api/api-client";
import type { PrejudiceStats } from "../types/profile.types";

export const profileApi = {
  async getPrejudiceStats(): Promise<PrejudiceStats> {
    const response = await apiClient.get<PrejudiceStats>(
      "/api/profile/prejudice-stats",
    );

    return response.data;
  },
};
