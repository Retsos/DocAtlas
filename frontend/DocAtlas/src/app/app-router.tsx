import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import { useAuth } from '@/app/providers/auth-provider'
import { ProtectedRoute } from '@/app/routes/protected-route'
import { Layout } from '@/components/website/Layout'
import { AuthPage } from '@/features/auth/pages/auth-page'
import { DashboardLayout } from '@/features/dashboard/layouts/dashboard-layout'
import { AppointmentsPage, PatientsPage, SettingsPage } from '@/features/dashboard/pages/dashboard-pages'
import { KnowledgeBasePage } from '@/features/knowledge-base/pages/knowledge-base-page'
import { About } from '@/pages/About'
import { Features } from '@/pages/Features'
import { Home } from '@/pages/Home'

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  return <Navigate to={isAuthenticated ? '/app/dashboard' : '/auth'} replace />
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
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<KnowledgeBasePage />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
