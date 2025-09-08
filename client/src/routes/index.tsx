import PageLoader from "@/components/ui/page-loader";
import useAuthExpiration from "@/hooks/use-auth-expiration";
import AppLayout from "@/layouts/app-layout";
import BaseLayout from "@/layouts/base-layout";
import { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthRoute from "./authRoute";
import { authenticationRoutePaths, protectedRoutePaths } from "./common/routes";
import ProtectedRoute from "./protectedRoute";

function AppRoutes() {
  useAuthExpiration();
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<AuthRoute />}>
            <Route element={<BaseLayout />}>
              {authenticationRoutePaths.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Route>
          </Route>
          {/* Protected Route */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {protectedRoutePaths.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                >
                  {route.children?.map((childRoute) => (
                    <Route
                      key={childRoute.path || "index"}
                      index={childRoute.index}
                      path={childRoute.path}
                      element={childRoute.element}
                    />
                  ))}
                </Route>
              ))}
            </Route>
          </Route>

          {/* Catch-all for undefined routes */}
          <Route path="*" element={<>404</>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
