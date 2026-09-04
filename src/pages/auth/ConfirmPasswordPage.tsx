import type { FormEvent } from 'react'
import { useState } from 'react'
import { IconLock, IconShieldLock } from '@tabler/icons-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { confirmPassword } from '@/services/authService'
import { getApiErrorMessage, getValidationErrors } from '@/utils/apiErrors'
import AuthShell from './AuthShell'

export default function ConfirmPasswordPage() {
  const navigate = useNavigate()
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [password, setPassword] = useState('')
  const [processing, setProcessing] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    setProcessing(true)

    try {
      const response = await confirmPassword(password)
      toast.success(response.message)
      navigate(-1)
    } catch (error) {
      setErrors(getValidationErrors(error))
      toast.error(getApiErrorMessage(error))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <AuthShell
      description="Masukkan ulang password untuk aksi sensitif"
      title="Konfirmasi Password"
    >
      <form className="space-y-5" onSubmit={submit}>
        <Input
          autoComplete="current-password"
          autoFocus
          error={errors.password?.[0]}
          icon={<IconLock size={18} />}
          label="Password"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          value={password}
        />
        <Button
          className="w-full"
          disabled={processing}
          icon={<IconShieldLock size={18} />}
          label={processing ? 'Memverifikasi...' : 'Lanjutkan'}
          type="submit"
        />
      </form>
    </AuthShell>
  )
}
