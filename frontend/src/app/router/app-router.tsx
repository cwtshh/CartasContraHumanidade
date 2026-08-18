import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage, SignInPage, SignUpPage } from "@/features/auth";
import { ProtectedRoute } from "./protected-route";
import { PublicOnlyRoute } from "./public-only-route";
import { routePaths } from "./route-paths";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path={routePaths.signIn} element={<SignInPage />} />
        <Route path={routePaths.signUp} element={<SignUpPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path={routePaths.home} element={<HomePage />} />
      </Route>

      <Route path="*" element={<Navigate to={routePaths.home} replace />} />
    </Routes>
  );
}
