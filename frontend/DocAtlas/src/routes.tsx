import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router-dom";

import { useAuth } from "@/providers/AuthProvider";
import { Layout } from "@/components/website/Layout";
import { AuthPage } from "@/pages/AuthPage";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KnowledgeBasePage } from "@/pages/KnowledgeBasePage";
import InstructionsPage from "@/pages/InstructionsPage";
import { Home } from "@/pages/HomePage";
import { Features } from "@/pages/FeaturesPage";
import { About } from "@/pages/AboutPage";

function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading session...</p>
      </div>
    );
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/auth" replace state={{ from: location }} />
  );
}

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />;
}

// eslint-disable-next-line react-refresh/only-export-components
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "features", element: <Features /> },
      { path: "about", element: <About /> },
    ],
  },
  { path: "/auth", element: <AuthPage /> },
  { path: "/redirect", element: <RootRedirect /> },

  {
    element: <AuthGuard />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <KnowledgeBasePage /> },
          { path: "/instructions", element: <InstructionsPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
