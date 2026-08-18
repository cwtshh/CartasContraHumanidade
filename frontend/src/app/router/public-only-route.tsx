import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/features/auth";
import { routePaths } from "./route-paths";

export function PublicOnlyRoute() {
  const session = useSession();

  if (session.isPending) {
    return <p>Verificando autenticação...</p>;
  }

  if (session.data) {
    return <Navigate to={routePaths.home} replace />;
  }

  return <Outlet />;
}
