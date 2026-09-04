import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ApiError } from "@/shared/api/api-error";
import { useSignIn } from "../hooks/use-sign-in";
import { useSignUp } from "../hooks/use-sign-up";
import { routePaths } from "@/app/router/route-paths";
import { setGuestIdentity } from "@/shared/lib/guest-identity";
import { Button, Input, Label, TextField } from "@heroui/react";
import {
  AuthFormTransition,
  AuthTabs,
  type AuthMode,
} from "../components/auth-animations";

const previewCards = [
  "Uma crise bem-sucedida",
  "O cheiro de fracasso",
  "Stalking no LinkedIn",
];

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<AuthMode>(
    location.pathname === routePaths.signUp ? "sign-up" : "sign-in",
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestName, setGuestName] = useState("");

  const signIn = useSignIn();
  const signUp = useSignUp();

  const isSignUp = mode === "sign-up";
  const isPending = signIn.isPending || signUp.isPending;

  function switchMode(nextMode: AuthMode) {
    if (nextMode === mode) return;

    setMode(nextMode);
    navigate(nextMode === "sign-up" ? routePaths.signUp : routePaths.signIn, {
      replace: true,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSignUp) {
      signUp.mutate(
        {
          name: name.trim(),
          email: email.trim(),
          password,
        },
        {
          onSuccess: () => {
            navigate(routePaths.home, { replace: true });
          },
        },
      );
      return;
    }

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

  function handleGuestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = guestName.trim();
    if (!trimmedName) return;

    setGuestIdentity(trimmedName);
    navigate(routePaths.home, { replace: true });
  }

  const activeMutation = isSignUp ? signUp : signIn;

  const errorMessage =
    activeMutation.error instanceof ApiError
      ? activeMutation.error.message
      : activeMutation.isError
        ? isSignUp
          ? "Não foi possível criar sua conta. Tente novamente."
          : "Não foi possível entrar. Tente novamente."
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

          <AuthTabs mode={mode} onChange={switchMode} />

          <div className="rounded-3xl border border-border bg-surface p-6 shadow-surface sm:p-8">
            <AuthFormTransition mode={mode}>
              <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                {isSignUp ? "Crie sua conta" : "Bem-vindo de volta"}
              </h1>
              <p className="mt-1 mb-6 text-sm text-muted">
                {isSignUp
                  ? "Cadastre-se pra começar a julgar seus amigos."
                  : "Entre pra continuar julgando seus amigos."}
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {isSignUp && (
                  <TextField
                  fullWidth
                  isRequired
                  isDisabled={isPending}
                  validationBehavior="aria"
                >
                    <Label>Nome</Label>
                    <Input
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Como podemos te chamar?"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </TextField>
                )}

                <TextField
                  fullWidth
                  isRequired
                  isDisabled={isPending}
                  isInvalid={!!errorMessage}
                  validationBehavior="aria"
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
                  isDisabled={isPending}
                  isInvalid={!!errorMessage}
                  validationBehavior="aria"
                >
                  <Label>Senha</Label>
                  <Input
                    name="password"
                    type="password"
                    autoComplete={
                      isSignUp ? "new-password" : "current-password"
                    }
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
                  className="mt-1 font-bold tracking-wide uppercase w-full"
                >
                  {isSignUp
                    ? signUp.isPending
                      ? "Criando conta..."
                      : "Criar conta"
                    : signIn.isPending
                      ? "Entrando..."
                      : "Entrar no jogo"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted">
                {isSignUp ? (
                  <>
                    Já tem uma conta?{" "}
                    <Link
                      to={routePaths.signIn}
                      onClick={() => setMode("sign-in")}
                      className="font-semibold text-accent hover:underline"
                    >
                      Entrar
                    </Link>
                  </>
                ) : (
                  <>
                    Ainda não possui conta?{" "}
                    <Link
                      to={routePaths.signUp}
                      onClick={() => setMode("sign-up")}
                      className="font-semibold text-accent hover:underline"
                    >
                      Criar conta
                    </Link>
                  </>
                )}
              </p>
            </AuthFormTransition>
          </div>

          <div className="mt-6 text-center">
            {!showGuestForm && (
              <button
                type="button"
                onClick={() => setShowGuestForm(true)}
                className="text-sm font-semibold text-muted hover:text-foreground hover:underline"
              >
                ou jogue como convidado
              </button>
            )}
          </div>

          <AnimatePresence initial={false}>
            {showGuestForm && (
              <motion.form
                onSubmit={handleGuestSubmit}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="mt-6 overflow-hidden"
              >
                <div className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 shadow-surface">
                  <div>
                    <h2 className="text-base font-extrabold tracking-tight text-foreground">
                      Jogar como convidado
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      Sem conta, sem senha. Só o nome pra começar a jogar.
                    </p>
                  </div>

                  <TextField fullWidth isRequired validationBehavior="aria" autoFocus>
                    <Label>Seu nome</Label>
                    <Input
                      name="guestName"
                      placeholder="Como te chamamos na sala?"
                      value={guestName}
                      onChange={(event) => setGuestName(event.target.value)}
                    />
                  </TextField>

                  <div className="flex justify-end gap-3">
                    <Button type="button" onClick={() => setShowGuestForm(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="font-bold tracking-wide uppercase">
                      Continuar
                    </Button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
