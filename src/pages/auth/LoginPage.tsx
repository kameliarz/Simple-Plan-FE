import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { IconLock, IconLogin, IconMail, IconShieldCheck } from '@tabler/icons-react'
import toast from 'react-hot-toast'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { fetchSsoConfig, login } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import type { SsoConfig } from '@/types/api'
import { getApiErrorMessage, getValidationErrors } from '@/utils/apiErrors'

export default function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setAuth = useAuthStore((state) => state.setAuth)
  const setAuthStatus = useAuthStore((state) => state.setAuthStatus)
  const navigate = useNavigate()
  const [email, setEmail] = useState('juniyasyos@gmail.com')
  const [password, setPassword] = useState('password')
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [ssoConfig, setSsoConfig] = useState<SsoConfig | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchSsoConfig()
        .then(setSsoConfig)
        .catch(() => setSsoConfig(null))
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProcessing(true)
    setErrors({})
    setAuthStatus('loading')

    try {
      const data = await login({ email, password })
      setAuth(data.token, data.user)
      toast.success(data.message)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setAuthStatus('unauthenticated')
      setErrors(getValidationErrors(error))
      toast.error(getApiErrorMessage(error))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary-600 text-white">
            <IconLogin size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Masuk</h1>
            <p className="text-sm text-slate-500">Simple Plan Dashboard</p>
          </div>
        </div>

        <form className="space-y-5" data-testid="login-form" onSubmit={submit}>
          <Input
            autoComplete="email"
            error={errors.email?.[0] ?? errors.login?.[0]}
            icon={<IconMail size={18} />}
            label="Email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@email.com"
            type="email"
            value={email}
          />
          <Input
            autoComplete="current-password"
            error={errors.password?.[0]}
            icon={<IconLock size={18} />}
            label="Password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            type="password"
            value={password}
          />
          <Button
            className="w-full"
            data-testid="login-submit"
            disabled={processing}
            label={processing ? 'Memproses...' : 'Masuk'}
            type="submit"
          />
        </form>
        {ssoConfig?.enabled && ssoConfig.login_url ? (
          <div className="mt-5">
            <Button
              className="w-full"
              icon={<IconShieldCheck size={18} />}
              label="Masuk dengan SSO"
              onClick={() => window.location.assign(ssoConfig.login_url ?? '')}
              type="button"
              variant="secondary"
            />
          </div>
        ) : null}
        <div className="mt-6 flex items-center justify-between text-sm">
          <Link className="font-medium text-primary-600" to="/register">
            Daftar akun
          </Link>
          <Link className="font-medium text-primary-600" to="/forgot-password">
            Lupa password?
          </Link>
        </div>
      </section>
    </main>
  )
}
