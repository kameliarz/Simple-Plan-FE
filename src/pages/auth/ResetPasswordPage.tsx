import type { FormEvent } from 'react'
import { useState } from 'react'
import { IconLock, IconMail } from '@tabler/icons-react'
import toast from 'react-hot-toast'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { resetPassword } from '@/services/authService'
import type { ResetPasswordPayload } from '@/types/api'
import { getApiErrorMessage, getValidationErrors } from '@/utils/apiErrors'
import AuthShell from './AuthShell'

export default function ResetPasswordPage() {
  const { token = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [form, setForm] = useState<ResetPasswordPayload>({
    email: searchParams.get('email') ?? '',
    password: '',
    password_confirmation: '',
    token,
  })
  const [processing, setProcessing] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    setProcessing(true)

    try {
      const response = await resetPassword(form)
      toast.success(response.message)
      navigate('/login', { replace: true })
    } catch (error) {
      setErrors(getValidationErrors(error))
      toast.error(getApiErrorMessage(error))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <AuthShell description="Buat password baru untuk akun Anda" title="Reset Password">
      <form className="space-y-5" onSubmit={submit}>
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
          autoComplete="new-password"
          error={errors.password?.[0]}
          icon={<IconLock size={18} />}
          label="Password Baru"
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
          label={processing ? 'Memproses...' : 'Reset Password'}
          type="submit"
        />
      </form>
    </AuthShell>
  )
}
