import {
  Outlet,
  createBrowserRouter,
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "@/providers/AuthProvider";
import { Layout } from "@/components/website/Layout";
import { KnowledgeBasePage } from "@/pages/KnowledgeBasePage";
import { AuthPage } from "@/pages/AuthPage";
import { DashboardLayout } from "@/components/DashboardLayout";
import HomePage from "@/pages/HomePage";
import { MyFilesPage } from "@/pages/MyFilesPage";
import ErrorPage from "./pages/ErrorPage";
import InstructionsPage from "@/pages/InstructionsPage";
import FeaturesPage from "@/pages/FeaturesPage";

import LogsPage from "./pages/LogsPage";
import WidgetSetupPage from "@/pages/WidgetSetupPage";
// eslint-disable-next-line react-refresh/only-export-components

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

// eslint-disable-next-line react-refresh/only-export-components
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "features", element: <FeaturesPage /> },
      { path: "instructions", element: <InstructionsPage /> },
    ],
  },
  { path: "/auth", element: <AuthPage /> },

  {
    element: <AuthGuard />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <DashboardLayout />,
        errorElement: <ErrorPage />,
        children: [
          { path: "/dashboard", element: <KnowledgeBasePage /> },
          { path: "/dashboard/my-files", element: <MyFilesPage /> },
          { path: "/widget-setup", element: <WidgetSetupPage /> },
          { path: "/logs", element: <LogsPage /> },
        ],
      },
    ],
  },
]);
