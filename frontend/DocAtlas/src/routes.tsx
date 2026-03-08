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
import { DashboardLayout } from "@/features/dashboard/layouts/dashboard-layout";
import { KnowledgeBasePage } from "@/features/knowledge-base/pages/knowledge-base-page";

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

  // PROTECTED SECTION
  {
    element: <AuthGuard />, // All children here are now protected
    children: [
      {
        path: "/",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <KnowledgeBasePage /> },
          { path: "patients", element: <PatientsPage /> },
          { path: "appointments", element: <AppointmentsPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
