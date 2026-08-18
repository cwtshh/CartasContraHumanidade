export const routePaths = {
  home: "/",
  signIn: "/sign-in",
  signUp: "/sign-up",
  rooms: "/rooms",
  room: (code: string) => `/rooms/${code}`,
  game: (id: string) => `/game/${id}`,
} as const;
