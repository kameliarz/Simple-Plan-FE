import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { exchangeSsoCode } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { getApiErrorMessage } from '@/utils/apiErrors'
import AuthShell from './AuthShell'

export default function SsoCallbackPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setAuth = useAuthStore((state) => state.setAuth)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const exchanged = useRef(false)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  useEffect(() => {
    if (!code || exchanged.current) {
      return
    }

    exchanged.current = true

    exchangeSsoCode({ code })
      .then((data) => {
        setAuth(data.token, data.user)
        toast.success(data.message)
        navigate('/dashboard', { replace: true })
      })
      .catch((caughtError: unknown) => {
        toast.error(getApiErrorMessage(caughtError))
        navigate('/login', { replace: true })
      })
  }, [code, navigate, setAuth])

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />
  }

  if (!code) {
    return (
      <AuthShell description={error ?? 'Kode SSO tidak tersedia'} title="SSO Gagal">
        <p className="text-sm text-slate-500">
          Login SSO tidak dapat dilanjutkan. Silakan kembali ke halaman login.
        </p>
      </AuthShell>
    )
  }

  return (
    <AuthShell description="Menukar kode SSO dengan sesi aplikasi" title="SSO Login">
      <div className="flex min-h-24 items-center justify-center text-sm text-slate-500">
        Memproses login SSO...
      </div>
    </AuthShell>
  )
}
