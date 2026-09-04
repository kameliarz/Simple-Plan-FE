import type { FormEvent } from 'react'
import { useState } from 'react'
import { IconArrowLeft, IconMail } from '@tabler/icons-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { forgotPassword } from '@/services/authService'
import { getApiErrorMessage, getValidationErrors } from '@/utils/apiErrors'
import AuthShell from './AuthShell'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [processing, setProcessing] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    setProcessing(true)

    try {
      const response = await forgotPassword({ email })
      setStatus(response.message)
      toast.success(response.message)
    } catch (error) {
      setErrors(getValidationErrors(error))
      toast.error(getApiErrorMessage(error))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <AuthShell
      description="Masukkan email untuk menerima link reset"
      title="Reset Password"
    >
      {status ? (
        <div className="mb-5 rounded-md bg-success-50 px-4 py-3 text-sm text-success-700">
          {status}
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={submit}>
        <Input
          autoComplete="email"
          error={errors.email?.[0]}
          icon={<IconMail size={18} />}
          label="Email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          value={email}
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            icon={<IconArrowLeft size={18} />}
            label="Kembali"
            to="/login"
            type="button"
            variant="secondary"
          />
          <Button
            disabled={processing}
            label={processing ? 'Mengirim...' : 'Kirim Link'}
            type="submit"
          />
        </div>
      </form>
    </AuthShell>
  )
}
