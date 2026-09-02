import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { authQueryKeys } from "../queries/auth.query-keys";
import type { SessionUser, SignUpInput } from "../types/auth.types";

function toSessionUser(user: {
  id: string;
  email: string;
  displayName: string;
  role: SessionUser["role"];
}): SessionUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  };
}

export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignUpInput) => authApi.signUp(input),

    onSuccess: (user) => {
      queryClient.setQueryData(authQueryKeys.session(), toSessionUser(user));
    },
  });
}
