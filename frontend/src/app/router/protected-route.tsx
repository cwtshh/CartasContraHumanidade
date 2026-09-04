import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "@/features/auth";
import { routePaths } from "./route-paths";
import { Loading } from "@/shared/pages/loading/Loading";
import { Header } from "@/shared/components/header";
import { getGuestIdentity } from "@/shared/lib/guest-identity";

export function ProtectedRoute() {
  const session = useSession();
  const location = useLocation();
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
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex-1"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
