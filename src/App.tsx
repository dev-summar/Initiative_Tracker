import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute'
import { DashboardPage } from './pages/Dashboard'
import { AreaDetailsPage } from './pages/AreaDetails'
import { StrategyPage } from './pages/StrategyPage'
import { PlanDetailPage } from './pages/PlanDetailPage'
import { LoginPage } from './pages/LoginPage'

const basename = (import.meta.env.VITE_BASE_PATH || '').replace(/\/$/, '') || undefined

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="area/strategy" element={<StrategyPage />} />
          <Route path="area/strategy/:planSlug" element={<PlanDetailPage />} />
          <Route path="area/:slug" element={<AreaDetailsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors closeButton />
    </BrowserRouter>
  )
}
