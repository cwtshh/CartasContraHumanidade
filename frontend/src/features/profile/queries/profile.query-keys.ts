export const profileQueryKeys = {
  all: ["profile"] as const,
  prejudiceStats: () => [...profileQueryKeys.all, "prejudice-stats"] as const,
};
