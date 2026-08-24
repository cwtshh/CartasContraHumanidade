import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "@/shared/api/api-error";
import { useSignIn } from "../hooks/use-sign-in";
import { routePaths } from "@/app/router/route-paths";
import { Button, Input, Label, TextField } from "@heroui/react";

const previewCards = [
  "Uma crise bem-sucedida",
  "O cheiro de fracasso",
  "Stalking no LinkedIn",
];

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
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Esquerda: branding */}
      <div className="hidden md:flex w-[54%] flex-col justify-between gap-10 relative overflow-hidden p-12 border-r border-border bg-surface-secondary">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-danger px-3 py-1 text-xs font-bold tracking-widest text-danger-foreground uppercase">
          Edição brasileira
        </span>

        <div className="flex flex-col gap-10">
          {/* Carta preta principal */}
          <div className="relative w-full max-w-md aspect-[5/7] rounded-3xl bg-black p-7 text-white shadow-2xl">
            <div className="flex h-full flex-col justify-between">
              <p className="text-3xl font-black leading-[0.95] tracking-tight uppercase">
                Cartas
                <br />
                Contra
                <br />
                <span className="text-danger">a Humanidade</span>
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-sm bg-white" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">
                    Cartas Contra Humanidade
                  </span>
                </div>
                <span className="text-[10px] font-bold tracking-widest text-white/50">
                  BR
                </span>
              </div>
            </div>
          </div>

          {/* Cards brancas empilhadas, viradas na mesa */}
          <div className="relative h-32 w-full max-w-md">
            {previewCards.map((text, i) => (
              <div
                key={text}
                className="absolute bottom-0 w-36 rounded-xl bg-white p-3 text-black shadow-xl"
                style={{
                  left: i * 44,
                  transform: `rotate(${(i - 1) * 6}deg)`,
                  transformOrigin: "bottom left",
                  zIndex: i,
                }}
              >
                <p className="m-0 text-xs leading-snug font-bold">{text}</p>
                <span className="mt-3 block h-2.5 w-2.5 rounded-[2px] bg-black" />
              </div>
            ))}
          </div>
        </div>

        <p className="max-w-xs text-sm leading-relaxed text-muted">
          O jogo de festas para pessoas horríveis. 3–20 jogadores. +18.
        </p>
      </div>

      {/* Direita: formulário */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          {/* Marca compacta (visível apenas em telas pequenas) */}
          <div className="mb-8 flex items-center gap-2 md:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-sm font-black text-white">
              C
            </span>
            <span className="text-sm font-bold tracking-widest text-muted uppercase">
              Cartas Contra Humanidade
            </span>
          </div>

          {/* Abas de modo (fixa em "ENTRAR" nesta página) */}
          <div className="mb-8 flex border-b border-border">
            <span className="mr-7 -mb-px border-b-2 border-danger pb-3.5 text-sm font-bold tracking-wide text-foreground uppercase">
              Entrar
            </span>
            <Link
              to={routePaths.signUp}
              className="mr-7 -mb-px pb-3.5 text-sm font-bold tracking-wide text-muted uppercase transition-colors hover:text-foreground"
            >
              Criar conta
            </Link>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 shadow-surface sm:p-8">
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">
              Bem-vindo de volta
            </h1>
            <p className="mt-1 mb-6 text-sm text-muted">
              Entre pra continuar julgando seus amigos.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <TextField
                fullWidth
                isRequired
                isDisabled={signIn.isPending}
                isInvalid={!!errorMessage}
              >
                <Label>Email</Label>
                <Input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </TextField>

              <TextField
                fullWidth
                isRequired
                isDisabled={signIn.isPending}
                isInvalid={!!errorMessage}
              >
                <Label>Senha</Label>
                <Input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </TextField>

              {errorMessage && (
                <p
                  role="alert"
                  className="rounded-xl bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger-soft-foreground"
                >
                  {errorMessage}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isDisabled={signIn.isPending}
                className="mt-1 font-bold tracking-wide uppercase"
              >
                {signIn.isPending ? "Entrando..." : "Entrar no jogo"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Ainda não possui conta?{" "}
              <Link
                to={routePaths.signUp}
                className="font-semibold text-accent hover:underline"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
