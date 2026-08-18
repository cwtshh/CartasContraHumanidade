import { useNavigate } from "react-router-dom";
import { useSignOut, useSession } from "@/features/auth";
import { routePaths } from "@/app/router/route-paths";

export function HomePage() {
  const navigate = useNavigate();
  const session = useSession();
  const signOut = useSignOut();

  function handleSignOut() {
    signOut.mutate(undefined, {
      onSuccess: () => {
        navigate(routePaths.signIn, { replace: true });
      },
    });
  }

  if (!session.data) {
    return null;
  }

  return (
    <main>
      <h1>Cartas Contra Humanidade</h1>

      <p>
        Bem-vindo, <strong>{session.data.displayName}</strong>.
      </p>

      <p>Email: {session.data.email}</p>
      <p>Role: {session.data.role}</p>

      <button
        type="button"
        disabled={signOut.isPending}
        onClick={handleSignOut}
      >
        {signOut.isPending ? "Saindo..." : "Sair"}
      </button>
    </main>
  );
}
