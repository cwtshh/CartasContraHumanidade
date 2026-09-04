import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/features/auth";
import { routePaths } from "./route-paths";
import { Loading } from "@/shared/pages/loading/Loading";
import { Header } from "@/shared/components/header";
import { getGuestIdentity } from "@/shared/lib/guest-identity";

export function ProtectedRoute() {
  const session = useSession();
  const isGuest = !!getGuestIdentity();

  if (session.isPending && !isGuest) {
    return <Loading />;
  }

  const hasAccess = !!session.data || isGuest;

  if (!hasAccess) {
    return <Navigate to={routePaths.signIn} replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
