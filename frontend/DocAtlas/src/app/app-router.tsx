import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import { useAuth } from "@/providers/AuthProvider";
import { ProtectedRoute } from "@/app/routes/protected-route";
import { Layout } from "@/components/website/Layout";
import { AuthPage } from "@/pages/AuthPage";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KnowledgeBasePage } from "@/pages/KnowledgeBasePage";
import { About } from "@/pages/AboutPage";
import { Features } from "@/pages/FeaturesPage";
import { Home } from "@/pages/HomePage";

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return <Navigate to={isAuthenticated ? "/app/dashboard" : "/auth"} replace />;
}

export function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="features" element={<Features />} />
          <Route path="about" element={<About />} />
        </Route>
        <Route path="/redirect" element={<RootRedirect />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={<Navigate to="/app/dashboard" replace />}
        />
        <Route path="/patients" element={<Navigate to="/app/patients" replace />} />
        <Route
          path="/appointments"
          element={<Navigate to="/app/appointments" replace />}
        />
        <Route
          path="/settings"
          element={<Navigate to="/app/settings" replace />}
        />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<KnowledgeBasePage />} />
          <Route path="patients" element={<Navigate to="../dashboard" replace />} />
          <Route
            path="appointments"
            element={<Navigate to="../dashboard" replace />}
          />
          <Route path="settings" element={<Navigate to="../dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
