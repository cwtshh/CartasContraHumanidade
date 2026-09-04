import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "@/features/auth";
import { LobbyPage, RoomsPage } from "@/features/rooms";
import { GamePage } from "@/features/game";
import { ProtectedRoute } from "./protected-route";
import { PublicOnlyRoute } from "./public-only-route";
import { routePaths } from "./route-paths";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path={routePaths.signIn} element={<AuthPage />} />
        <Route path={routePaths.signUp} element={<AuthPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path={routePaths.home} element={<RoomsPage />} />
        <Route path="/rooms/:code" element={<LobbyPage />} />
        <Route path="/game/:code" element={<GamePage />} />
      </Route>

      <Route path="*" element={<Navigate to={routePaths.home} replace />} />
    </Routes>
  );
}
