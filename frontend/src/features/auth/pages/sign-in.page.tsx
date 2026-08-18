import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "@/shared/api/api-error";
import { useSignIn } from "../hooks/use-sign-in";
import { routePaths } from "@/app/router/route-paths";

export function SignInPage() {
  const navigate = useNavigate();
  const signIn = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    signIn.mutate(
      {
        email: email.trim(),
        password,
      },
      {
        onSuccess: () => {
          navigate(routePaths.home, { replace: true });
        },
      },
    );
  }

  const errorMessage =
    signIn.error instanceof ApiError
      ? signIn.error.message
      : signIn.isError
        ? "Não foi possível entrar. Tente novamente."
        : null;

  return (
    <main>
      <h1>Entrar</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={signIn.isPending}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Senha</label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={signIn.isPending}
            required
          />
        </div>

        {errorMessage && <p role="alert">{errorMessage}</p>}

        <button type="submit" disabled={signIn.isPending}>
          {signIn.isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p>
        Ainda não possui conta? <Link to={routePaths.signUp}>Criar conta</Link>
      </p>
    </main>
  );
}
