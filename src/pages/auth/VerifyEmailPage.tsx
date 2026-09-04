import { IconLogout, IconRefresh } from '@tabler/icons-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { fetchMe, logout, resendVerificationEmail } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { getApiErrorMessage } from '@/utils/apiErrors'
import AuthShell from './AuthShell'

export default function VerifyEmailPage() {
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const setUser = useAuthStore((state) => state.setUser)
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  const handleResend = async () => {
    try {
      const response = await resendVerificationEmail()
      toast.success(response.message)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleRefresh = async () => {
    try {
      const profile = await fetchMe()
      setUser(profile)

      if (profile.email_verified_at) {
        toast.success('Email sudah terverifikasi.')
        navigate('/dashboard', { replace: true })
        return
      }

      toast.error('Email belum terverifikasi.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      clearAuth()
      navigate('/login', { replace: true })
    }
  }

  return (
    <AuthShell
      description={user?.email ?? 'Kirim ulang link verifikasi email'}
      title="Verifikasi Email"
    >
      <div className="space-y-5 text-sm text-slate-600">
        <p>
          Klik link verifikasi yang dikirim ke email Anda. Jika belum menerima
          email, kirim ulang dari tombol di bawah.
        </p>
        <Button
          className="w-full"
          icon={<IconRefresh size={18} />}
          label="Kirim Ulang Verifikasi"
          onClick={() => void handleResend()}
          type="button"
        />
        <Button
          className="w-full"
          label="Cek Status Verifikasi"
          onClick={() => void handleRefresh()}
          type="button"
          variant="secondary"
        />
        <Button
          className="w-full"
          icon={<IconLogout size={18} />}
          label="Logout"
          onClick={() => void handleLogout()}
          type="button"
          variant="ghost"
        />
      </div>
    </AuthShell>
  )
}
