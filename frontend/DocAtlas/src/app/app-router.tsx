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
import InstructionsPage from "@/pages/InstructionsPage";

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />;
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
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<KnowledgeBasePage />} />
            <Route path="/instructions" element={<InstructionsPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
