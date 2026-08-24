import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/features/auth";
import { routePaths } from "./route-paths";
import { Loading } from "@/shared/pages/loading/Loading";

export function PublicOnlyRoute() {
  const session = useSession();

  if (session.isPending) {
    return <Loading />;
  }

  if (session.data) {
    return <Navigate to={routePaths.home} replace />;
  }

  return <Outlet />;
}
