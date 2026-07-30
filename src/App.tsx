import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { PageLoader } from './components/common/PageLoader'
import { AreaDetailsPage } from './pages/AreaDetails'
import { StrategyPage } from './pages/StrategyPage'
import { PlanDetailPage } from './pages/PlanDetailPage'
import { LoginPage } from './pages/LoginPage'

const DashboardPage = lazy(() =>
  import('./pages/Dashboard').then((m) => ({ default: m.DashboardPage })),
)

const basename = (import.meta.env.VITE_BASE_PATH || '').replace(/\/$/, '') || undefined

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <ErrorBoundary fallbackTitle="The page crashed after login">
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
            <Route
              index
              element={
                <Suspense fallback={<PageLoader />}>
                  <DashboardPage />
                </Suspense>
              }
            />
            <Route path="area/strategy" element={<StrategyPage />} />
            <Route path="area/strategy/:planSlug" element={<PlanDetailPage />} />
            <Route path="area/:slug" element={<AreaDetailsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ErrorBoundary>
      <Toaster position="top-right" richColors closeButton />
    </BrowserRouter>
  )
}
