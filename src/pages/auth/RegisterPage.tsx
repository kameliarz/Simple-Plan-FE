import type { FormEvent } from 'react'
import { useState } from 'react'
import { IconId, IconLock, IconMail, IconUser } from '@tabler/icons-react'
import toast from 'react-hot-toast'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { register } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import type { RegisterPayload } from '@/types/api'
import { getApiErrorMessage, getValidationErrors } from '@/utils/apiErrors'
import AuthShell from './AuthShell'

const emptyForm: RegisterPayload = {
  email: '',
  name: '',
  nip: '',
  password: '',
  password_confirmation: '',
}

export default function RegisterPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [form, setForm] = useState(emptyForm)
  const [processing, setProcessing] = useState(false)

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    setProcessing(true)

    try {
      const data = await register(form)
      setAuth(data.token, data.user)
      toast.success(data.message)
      navigate('/verify-email', { replace: true })
    } catch (error) {
      setErrors(getValidationErrors(error))
      toast.error(getApiErrorMessage(error))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <AuthShell description="Buat akun baru" title="Daftar">
      <form className="space-y-5" onSubmit={submit}>
        <Input
          autoComplete="name"
          error={errors.name?.[0]}
          icon={<IconUser size={18} />}
          label="Nama Lengkap"
          name="name"
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          value={form.name}
        />
        <Input
          autoComplete="email"
          error={errors.email?.[0]}
          icon={<IconMail size={18} />}
          label="Email"
          name="email"
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
          type="email"
          value={form.email}
        />
        <Input
          error={errors.nip?.[0]}
          icon={<IconId size={18} />}
          label="NIP"
          name="nip"
          onChange={(event) =>
            setForm((current) => ({ ...current, nip: event.target.value }))
          }
          value={form.nip}
        />
        <Input
          autoComplete="new-password"
          error={errors.password?.[0]}
          icon={<IconLock size={18} />}
          label="Password"
          name="password"
          onChange={(event) =>
            setForm((current) => ({ ...current, password: event.target.value }))
          }
          type="password"
          value={form.password}
        />
        <Input
          autoComplete="new-password"
          error={errors.password_confirmation?.[0]}
          icon={<IconLock size={18} />}
          label="Konfirmasi Password"
          name="password_confirmation"
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              password_confirmation: event.target.value,
            }))
          }
          type="password"
          value={form.password_confirmation}
        />
        <Button
          className="w-full"
          disabled={processing}
          label={processing ? 'Memproses...' : 'Daftar Sekarang'}
          type="submit"
        />
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Sudah punya akun?{' '}
        <Link className="font-medium text-primary-600" to="/login">
          Masuk
        </Link>
      </p>
    </AuthShell>
  )
}
