export const roomsQueryKeys = {
  all: ["rooms"] as const,

  byCode: (code: string) => [...roomsQueryKeys.all, code] as const,

  list: (page: number, size: number) =>
    [...roomsQueryKeys.all, "list", page, size] as const,
} as const;
