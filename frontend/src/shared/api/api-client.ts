import axios, { type AxiosError } from "axios";
import { env } from "@/shared/config/env";
import { getGuestIdentity } from "@/shared/lib/guest-identity";
import { ApiError, type ApiErrorBody } from "./api-error";

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const guest = getGuestIdentity();

  if (guest) {
    config.headers.set("X-Guest-Id", guest.id);
  }

  return config;
});

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === "object" && value !== null;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<unknown>) => {
    if (error.response) {
      const body = isApiErrorBody(error.response.data)
        ? error.response.data
        : null;

      const message =
        body?.message ?? getFallbackErrorMessage(error.response.status);

      return Promise.reject(new ApiError(error.response.status, message, body));
    }

    if (error.request) {
      return Promise.reject(
        new ApiError(
          0,
          "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
        ),
      );
    }

    return Promise.reject(
      new ApiError(
        0,
        error.message || "Não foi possível preparar a requisição.",
      ),
    );
  },
);

function getFallbackErrorMessage(status: number): string {
  if (status === 401) {
    return "Sua sessão expirou ou é inválida.";
  }

  if (status === 403) {
    return "Você não tem permissão para realizar esta ação.";
  }

  if (status === 404) {
    return "O recurso solicitado não foi encontrado.";
  }

  if (status >= 500) {
    return "O servidor encontrou um erro. Tente novamente.";
  }

  return "Não foi possível concluir a requisição.";
}
