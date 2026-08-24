import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/features/auth";
import { routePaths } from "./route-paths";
import { Loading } from "@/shared/pages/loading/Loading";

export function ProtectedRoute() {
  const session = useSession();

  if (session.isPending) {
    return <Loading />;
  }

  if (session.isError || !session.data) {
    return <Navigate to={routePaths.signIn} replace />;
  }

  return <Outlet />;
}
