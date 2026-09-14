import { lazy, Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import { useAuthStore } from '@/stores/authStore'

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const BackupsPage = lazy(() => import('@/pages/backups/BackupsPage'))
const ConfirmPasswordPage = lazy(
  () => import('@/pages/auth/ConfirmPasswordPage'),
)
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const ExampleLivePage = lazy(
  () => import('@/pages/example-live/ExampleLivePage'),
)
const ForgotPasswordPage = lazy(
  () => import('@/pages/auth/ForgotPasswordPage'),
)
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const RolesPage = lazy(() => import('@/pages/roles/RolesPage'))
const SsoCallbackPage = lazy(() => import('@/pages/auth/SsoCallbackPage'))
const UnitsPage = lazy(() => import('@/pages/units/UnitsPage'))
const UsersPage = lazy(() => import('@/pages/users/UsersPage'))
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'))


const UIComponentsPage = lazy(
  () => import('@/pages/UIComponents'),
)


function PageLoader() {
  return (
    <div className="flex min-h-64 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
      Memuat halaman...
    </div>
  )
}

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

function RootRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/sso/callback" element={<SsoCallbackPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/backups" element={<BackupsPage />} />
              <Route path="/example-live" element={<ExampleLivePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/roles" element={<RolesPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/units" element={<UnitsPage />} />
              <Route path="/ui-components" element={<UIComponentsPage />} />
            </Route>
            <Route path="/confirm-password" element={<ConfirmPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Route>
          <Route
            path="*"
            element={
              <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <section className="text-center">
                  <h1 className="text-2xl font-semibold text-slate-950">
                    Halaman tidak ditemukan
                  </h1>
                  <Link
                    to="/"
                    className="mt-4 inline-flex rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
                  >
                    Kembali
                  </Link>
                </section>
              </main>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
