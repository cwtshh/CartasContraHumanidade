function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  apiUrl: requireEnv("VITE_API_URL", import.meta.env.VITE_API_URL),
} as const;
