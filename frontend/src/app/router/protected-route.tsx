import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/features/auth";
import { routePaths } from "./route-paths";

export function ProtectedRoute() {
  const session = useSession();

  if (session.isPending) {
    return <p>Verificando autenticação...</p>;
  }

  if (session.isError || !session.data) {
    return <Navigate to={routePaths.signIn} replace />;
  }

  return <Outlet />;
}
