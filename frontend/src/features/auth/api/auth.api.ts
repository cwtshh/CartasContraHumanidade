import { apiClient } from "@/shared/api/api-client";
import type {
  AuthUser,
  SessionUser,
  SignInInput,
  SignUpInput,
} from "../types/auth.types";

export const authApi = {
  async getSession(): Promise<SessionUser> {
    const response = await apiClient.get<SessionUser>("/api/auth/session");

    return response.data;
  },

  async signIn(input: SignInInput): Promise<AuthUser> {
    const response = await apiClient.post<AuthUser>("/api/auth/sign-in", input);

    return response.data;
  },

  async signUp(input: SignUpInput): Promise<AuthUser> {
    const response = await apiClient.post<AuthUser>("/api/auth/sign-up", input);

    return response.data;
  },

  async refresh(): Promise<SessionUser> {
    const response = await apiClient.post<SessionUser>("/api/auth/refresh");

    return response.data;
  },

  async signOut(): Promise<void> {
    await apiClient.post("/api/auth/sign-out");
  },

  async signOutAll(): Promise<void> {
    await apiClient.post("/api/auth/sign-out-all");
  },
};
