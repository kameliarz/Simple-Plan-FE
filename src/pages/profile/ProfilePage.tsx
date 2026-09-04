import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import {
  IconBuildingCommunity,
  IconIdBadge2,
  IconKey,
  IconShieldLock,
  IconTrash,
  IconUserCircle,
} from '@tabler/icons-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import Button from '@/components/ui/Button'
import AvatarUploader from '@/components/ui/AvatarUploader'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import {
  deleteProfile,
  fetchProfile,
  updateProfile,
  updateProfilePassword,
} from '@/services/profileService'
import { useAuthStore } from '@/stores/authStore'
import type {
  ProfileDestroyPayload,
  ProfilePasswordPayload,
  ProfilePayload,
} from '@/types/api'
import { cn } from '@/utils/cn'
import { getApiErrorMessage, getValidationErrors } from '@/utils/apiErrors'

const emptyPasswordForm: ProfilePasswordPayload = {
  current_password: '',
  password: '',
  password_confirmation: '',
}

const emptyDeleteForm: ProfileDestroyPayload = {
  password: '',
}

const tabs = [
  { icon: IconIdBadge2, name: 'Informasi Pribadi' },
  { icon: IconBuildingCommunity, name: 'Hak Akses & Departemen' },
  { icon: IconShieldLock, name: 'Keamanan Akun' },
]

export default function ProfilePage() {
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const setUser = useAuthStore((state) => state.setUser)
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string[]>>({})
  const [deleteForm, setDeleteForm] = useState(emptyDeleteForm)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string[]>>(
    {},
  )
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm)
  const [passwordProcessing, setPasswordProcessing] = useState(false)
  const [profileErrors, setProfileErrors] = useState<Record<string, string[]>>(
    {},
  )
  const [profileForm, setProfileForm] = useState<ProfilePayload>({
    avatar: null,
    email: user?.email ?? '',
    name: user?.name ?? '',
    nip: user?.nip ?? '',
  })
  const [profileProcessing, setProfileProcessing] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatar ?? null,
  )

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchProfile()
        .then((profile) => {
          setUser(profile)
          setProfileForm({
            avatar: null,
            email: profile.email ?? '',
            name: profile.name,
            nip: profile.nip ?? '',
          })
          setAvatarPreview(profile.avatar ?? null)
        })
        .catch((error: unknown) => {
          toast.error(getApiErrorMessage(error))
        })
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [setUser])

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  const handleAvatarChange = (file: File | null) => {
    setProfileForm((current) => ({
      ...current,
      avatar: file,
    }))

    setAvatarPreview((currentPreview) => {
      if (currentPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(currentPreview)
      }

      return file ? URL.createObjectURL(file) : (user?.avatar ?? null)
    })
  }

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileProcessing(true)
    setProfileErrors({})

    try {
      const response = await updateProfile(profileForm)

      setUser(response.data)
      setProfileForm((current) => ({
        ...current,
        avatar: null,
      }))
      setAvatarPreview(response.data.avatar ?? null)
      toast.success(response.message ?? 'Profil berhasil diperbarui.')
    } catch (error) {
      setProfileErrors(getValidationErrors(error))
      toast.error(getApiErrorMessage(error))
    } finally {
      setProfileProcessing(false)
    }
  }

  const submitPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordProcessing(true)
    setPasswordErrors({})

    try {
      const response = await updateProfilePassword(passwordForm)

      setPasswordForm(emptyPasswordForm)
      toast.success(response.message)
    } catch (error) {
      setPasswordErrors(getValidationErrors(error))
      toast.error(getApiErrorMessage(error))
    } finally {
      setPasswordProcessing(false)
    }
  }

  const submitDelete = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setDeleteErrors({})

    const result = await Swal.fire({
      cancelButtonText: 'Batal',
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Hapus Akun',
      icon: 'warning',
      showCancelButton: true,
      text: 'Akun dan token login Anda akan dihapus permanen.',
      title: 'Hapus akun ini?',
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      const response = await deleteProfile(deleteForm)

      toast.success(response.message)
      clearAuth()
      navigate('/login', { replace: true })
    } catch (error) {
      setDeleteErrors(getValidationErrors(error))
      toast.error(getApiErrorMessage(error))
    }
  }

  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() ??
    user?.email?.charAt(0)?.toUpperCase() ??
    '?'

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-xl font-semibold text-primary-700">
            {user?.avatar ? (
              <img
                alt={user.name}
                className="size-full object-cover"
                src={user.avatar}
              />
            ) : (
              userInitial
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
              Profil Saya
            </h1>
            <p className="text-sm text-slate-500">
              Kelola informasi akun, peran kerja, dan pengaturan keamanan.
            </p>
          </div>
        </div>
      </div>

      <TabGroup>
        <TabList className="flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {tabs.map((tab) => (
            <Tab
              className={({ selected }) =>
                cn(
                  'flex min-h-11 items-center gap-2 whitespace-nowrap rounded-md px-4 text-sm font-medium outline-none transition',
                  selected
                    ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-900 dark:text-primary-300'
                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-100',
                )
              }
              key={tab.name}
            >
              <tab.icon size={18} strokeWidth={1.5} />
              {tab.name}
            </Tab>
          ))}
        </TabList>

        <TabPanels className="mt-5">
          <TabPanel>
            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <header>
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                  Informasi Profil
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Perbarui nama, email, dan NIP akun Anda.
                </p>
              </header>

              <form className="mt-6 max-w-2xl space-y-5" onSubmit={submitProfile}>
                <AvatarUploader
                  canClear={Boolean(profileForm.avatar)}
                  disabled={profileProcessing}
                  error={profileErrors.avatar?.[0]}
                  name={profileForm.name}
                  onChange={handleAvatarChange}
                  preview={avatarPreview}
                />
                <Input
                  autoComplete="name"
                  error={profileErrors.name?.[0]}
                  label="Nama Lengkap"
                  name="name"
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  value={profileForm.name}
                />
                <Input
                  autoComplete="username"
                  error={profileErrors.email?.[0]}
                  label="Alamat Email"
                  name="email"
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  type="email"
                  value={profileForm.email}
                />
                <Input
                  error={profileErrors.nip?.[0]}
                  label="NIP"
                  name="nip"
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      nip: event.target.value,
                    }))
                  }
                  value={profileForm.nip ?? ''}
                />
                <Button
                  disabled={profileProcessing}
                  icon={<IconUserCircle size={18} />}
                  label={profileProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                  type="submit"
                />
              </form>
            </section>
          </TabPanel>

          <TabPanel>
            <div className="grid gap-5 md:grid-cols-2">
              <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                  Akses Group
                </h2>
                <div className="mt-4 space-y-2">
                  {user?.roles?.length ? (
                    user.roles.map((role) => (
                      <div
                        className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                        key={role.id}
                      >
                        {role.name}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      Anda belum memiliki role khusus.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                  Departemen
                </h2>
                <div className="mt-4 space-y-2">
                  {user?.units?.length ? (
                    user.units.map((unit) => (
                      <div
                        className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                        key={unit.id}
                      >
                        {unit.unit_name}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      Anda belum ditugaskan ke departemen mana pun.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </TabPanel>

          <TabPanel>
            <div className="space-y-5">
              <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <header>
                  <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                    Perbarui Password
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Gunakan password yang panjang dan tidak mudah ditebak.
                  </p>
                </header>

                <form
                  className="mt-6 max-w-2xl space-y-5"
                  onSubmit={submitPassword}
                >
                  <Input
                    autoComplete="current-password"
                    error={passwordErrors.current_password?.[0]}
                    label="Password Saat Ini"
                    name="current_password"
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        current_password: event.target.value,
                      }))
                    }
                    type="password"
                    value={passwordForm.current_password}
                  />
                  <Input
                    autoComplete="new-password"
                    error={passwordErrors.password?.[0]}
                    label="Password Baru"
                    name="password"
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    type="password"
                    value={passwordForm.password}
                  />
                  <Input
                    autoComplete="new-password"
                    error={passwordErrors.password_confirmation?.[0]}
                    label="Konfirmasi Password"
                    name="password_confirmation"
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        password_confirmation: event.target.value,
                      }))
                    }
                    type="password"
                    value={passwordForm.password_confirmation}
                  />
                  <Button
                    disabled={passwordProcessing}
                    icon={<IconKey size={18} />}
                    label={
                      passwordProcessing ? 'Memperbarui...' : 'Perbarui Password'
                    }
                    type="submit"
                  />
                </form>
              </section>

              <section className="rounded-lg border border-danger-200 bg-white p-6 shadow-sm dark:border-danger-900/40 dark:bg-slate-900">
                <h2 className="text-lg font-semibold text-danger-700 dark:text-danger-300">
                  Hapus Akun
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                  Setelah akun dihapus, token login dan akses akun akan dicabut.
                </p>
                <Button
                  className="mt-5"
                  icon={<IconTrash size={18} />}
                  label="Hapus Akun"
                  onClick={() => {
                    setDeleteErrors({})
                    setDeleteForm(emptyDeleteForm)
                    setDeleteModalOpen(true)
                  }}
                  type="button"
                  variant="danger"
                />
              </section>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>

      <Modal
        maxWidth="md"
        onClose={() => setDeleteModalOpen(false)}
        show={deleteModalOpen}
        title="Hapus Akun"
      >
        <form className="space-y-5" onSubmit={submitDelete}>
          <p className="text-sm text-slate-500">
            Masukkan password Anda untuk mengonfirmasi penghapusan akun.
          </p>
          <Input
            autoFocus
            error={deleteErrors.password?.[0]}
            label="Password"
            name="password"
            onChange={(event) =>
              setDeleteForm({ password: event.target.value })
            }
            type="password"
            value={deleteForm.password}
          />
          <div className="flex justify-end gap-2">
            <Button
              label="Batal"
              onClick={() => setDeleteModalOpen(false)}
              type="button"
              variant="secondary"
            />
            <Button
              icon={<IconTrash size={18} />}
              label="Hapus Akun"
              type="submit"
              variant="danger"
            />
          </div>
        </form>
      </Modal>
    </section>
  )
}
