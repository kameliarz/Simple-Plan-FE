import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import {
  IconEdit,
  IconPlus,
  IconTrash,
  IconUserCheck,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'
import ResourceToolbar from '@/components/ui/ResourceToolbar'
import Table from '@/components/ui/Table'
import { useBulkSelect } from '@/hooks/useBulkSelect'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { startImpersonation as startImpersonationRequest } from '@/services/impersonationService'
import { userUnitsLabel } from '@/services/userService'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userStore'
import type { UserPayload } from '@/types/api'
import type { AuthUser } from '@/types/auth'
import { getApiErrorMessage, getValidationErrors } from '@/utils/apiErrors'
import { can } from '@/utils/authorization'

type UserFormState = UserPayload & {
  password: string
  password_confirmation: string
}

const emptyForm: UserFormState = {
  email: '',
  name: '',
  nip: '',
  password: '',
  password_confirmation: '',
  selectedRoles: [],
  selectedUnits: [],
  status: 'active',
}

export default function UsersPage() {
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [form, setForm] = useState<UserFormState>(emptyForm)
  const [impersonatingId, setImpersonatingId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null)
  const currentUser = useAuthStore((state) => state.user)
  const startAuthImpersonation = useAuthStore(
    (state) => state.startImpersonation,
  )
  const createUser = useUserStore((state) => state.createUser)
  const deleteUser = useUserStore((state) => state.deleteUser)
  const loadUsers = useUserStore((state) => state.loadUsers)
  const loading = useUserStore((state) => state.loading)
  const meta = useUserStore((state) => state.meta)
  const query = useUserStore((state) => state.query)
  const roles = useUserStore((state) => state.roles)
  const setPage = useUserStore((state) => state.setPage)
  const setPerPage = useUserStore((state) => state.setPerPage)
  const setSearch = useUserStore((state) => state.setSearch)
  const units = useUserStore((state) => state.units)
  const updateUser = useUserStore((state) => state.updateUser)
  const users = useUserStore((state) => state.users)
  const navigate = useNavigate()
  const { clear, isAllSelected, isSelected, selected, toggle, toggleAll } =
    useBulkSelect(users)
  const { confirmDelete: confirmDeleteAction } = useDeleteConfirm()
  const canStartImpersonation = can('impersonate', currentUser)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadUsers().catch((error: unknown) => {
        toast.error(getApiErrorMessage(error))
      })
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadUsers])

  const openCreateModal = () => {
    setSelectedUser(null)
    setForm(emptyForm)
    setErrors({})
    setModalOpen(true)
  }

  const openEditModal = (user: AuthUser) => {
    setSelectedUser(user)
    setForm({
      email: user.email ?? '',
      name: user.name,
      nip: user.nip ?? '',
      password: '',
      password_confirmation: '',
      selectedRoles: user.roles?.map((role) => role.name) ?? [],
      selectedUnits: user.units?.map((unit) => unit.id) ?? [],
      status:
        user.status === 'inactive' || user.status === 'suspended'
          ? user.status
          : 'active',
    })
    setErrors({})
    setModalOpen(true)
  }

  const toggleRole = (roleName: string) => {
    setForm((current) => ({
      ...current,
      selectedRoles: current.selectedRoles.includes(roleName)
        ? current.selectedRoles.filter((name) => name !== roleName)
        : [...current.selectedRoles, roleName],
    }))
  }

  const toggleUnit = (unitId: number) => {
    setForm((current) => ({
      ...current,
      selectedUnits: current.selectedUnits.includes(unitId)
        ? current.selectedUnits.filter((id) => id !== unitId)
        : [...current.selectedUnits, unitId],
    }))
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProcessing(true)
    setErrors({})

    const payload: UserPayload = {
      email: form.email,
      name: form.name,
      nip: form.nip,
      selectedRoles: form.selectedRoles,
      selectedUnits: form.selectedUnits,
      status: form.status,
    }

    if (form.password) {
      payload.password = form.password
      payload.password_confirmation = form.password_confirmation
    }

    try {
      const message = selectedUser
        ? await updateUser(selectedUser.id, payload)
        : await createUser(payload)

      toast.success(message ?? 'Data pengguna tersimpan.')
      setModalOpen(false)
    } catch (error) {
      setErrors(getValidationErrors(error))
      toast.error(getApiErrorMessage(error))
    } finally {
      setProcessing(false)
    }
  }

  const confirmDelete = (user: AuthUser) =>
    confirmDeleteAction({
      onConfirm: async () => {
        await deleteUser(user.id)
        clear()
        toast.success('Pengguna berhasil dihapus.')
      },
      text: `Pengguna ${user.name} akan dihapus.`,
      title: 'Hapus pengguna?',
    }).catch((error: unknown) => {
      toast.error(getApiErrorMessage(error))
    })

  const confirmBulkDelete = () =>
    confirmDeleteAction({
      confirmText: 'Hapus Semua',
      onConfirm: async () => {
        await deleteUser(selected.join(','))
        clear()
        toast.success('Pengguna terpilih berhasil dihapus.')
      },
      text: `${selected.length} pengguna akan dihapus.`,
      title: 'Hapus pengguna terpilih?',
    }).catch((error: unknown) => {
      toast.error(getApiErrorMessage(error))
    })

  const handleStartImpersonation = async (user: AuthUser) => {
    setImpersonatingId(user.id)

    try {
      const response = await startImpersonationRequest(user.id)
      startAuthImpersonation(response.token, response.user, response.impersonator)
      toast.success(response.message)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setImpersonatingId(null)
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
            Manajemen User
          </h1>
          <p className="text-sm text-slate-500">
            Kelola pengguna, role, dan unit kerja.
          </p>
        </div>
        <Button
          data-testid="user-create-open"
          icon={<IconPlus size={18} />}
          label="Tambah User"
          onClick={openCreateModal}
        />
      </div>

      <div>
        <Table.Card
          icon={<IconUsers size={18} />}
          title={`Daftar User (${meta?.total ?? users.length})`}
        />
        <ResourceToolbar
          onPerPageChange={(value) => {
            setPerPage(value).catch((error: unknown) => {
              toast.error(getApiErrorMessage(error))
            })
          }}
          onSearchChange={(value) => {
            setSearch(value).catch((error: unknown) => {
              toast.error(getApiErrorMessage(error))
            })
          }}
          perPage={query.perPage}
          search={query.search}
          searchPlaceholder="Cari user..."
        >
          {selected.length > 0 ? (
            <Button
              hideLabelOnMobile
              icon={<IconTrash size={18} />}
              label={`Hapus (${selected.length})`}
              onClick={() => void confirmBulkDelete()}
              type="button"
              variant="danger"
            />
          ) : null}
        </ResourceToolbar>
        <Table data-testid="users-table">
          <Table.Thead>
            <tr>
              <Table.Th className="w-12">
                <input
                  checked={isAllSelected}
                  className="rounded border-slate-300 text-primary-600 shadow-sm focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900"
                  onChange={(event) => toggleAll(event.target.checked)}
                  type="checkbox"
                />
              </Table.Th>
              <Table.Th>Nama</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>NIP</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Unit</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th className="w-44 text-right">Aksi</Table.Th>
            </tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Empty colSpan={8} message="Memuat data user..." />
            ) : users.length === 0 ? (
              <Table.Empty colSpan={8} message="Belum ada user." />
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <Table.Td>
                    <input
                      checked={isSelected(user.id)}
                      className="rounded border-slate-300 text-primary-600 shadow-sm focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900"
                      onChange={() => toggle(user.id)}
                      type="checkbox"
                    />
                  </Table.Td>
                  <Table.Td className="font-medium text-slate-900 dark:text-slate-100">
                    {user.name}
                  </Table.Td>
                  <Table.Td>{user.email}</Table.Td>
                  <Table.Td>{user.nip ?? '-'}</Table.Td>
                  <Table.Td>
                    {user.roles?.map((role) => role.name).join(', ') ?? '-'}
                  </Table.Td>
                  <Table.Td>{userUnitsLabel(user.units)}</Table.Td>
                  <Table.Td>
                    <span className="rounded-md bg-success-50 px-2 py-1 text-xs font-medium text-success-700">
                      {user.status ?? 'active'}
                    </span>
                  </Table.Td>
                  <Table.Td>
                    <div className="flex justify-end gap-2">
                      {canStartImpersonation && user.id !== currentUser?.id ? (
                        <Button
                          data-testid={`user-impersonate-${user.id}`}
                          disabled={impersonatingId !== null}
                          icon={<IconUserCheck size={16} />}
                          onClick={() => void handleStartImpersonation(user)}
                          size="icon"
                          title={`Masuk sebagai ${user.name}`}
                          variant="ghost"
                        />
                      ) : null}
                      <Button
                        data-testid={`user-edit-${user.id}`}
                        icon={<IconEdit size={16} />}
                        onClick={() => openEditModal(user)}
                        size="icon"
                        variant="secondary"
                      />
                      <Button
                        data-testid={`user-delete-${user.id}`}
                        icon={<IconTrash size={16} />}
                        onClick={() => void confirmDelete(user)}
                        size="icon"
                        variant="danger"
                      />
                    </div>
                  </Table.Td>
                </tr>
              ))
            )}
          </Table.Tbody>
        </Table>
        <Pagination
          meta={meta}
          onPageChange={(page) => {
            setPage(page).catch((error: unknown) => {
              toast.error(getApiErrorMessage(error))
            })
          }}
        />
      </div>

      <Modal
        maxWidth="2xl"
        onClose={() => setModalOpen(false)}
        show={modalOpen}
        title={selectedUser ? 'Edit User' : 'Tambah User'}
      >
        <form className="space-y-5" data-testid="user-form" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              autoFocus
              error={errors.name?.[0]}
              label="Nama"
              name="name"
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              value={form.name}
            />
            <Input
              error={errors.email?.[0]}
              label="Email"
              name="email"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              type="email"
              value={form.email}
            />
            <Input
              error={errors.nip?.[0]}
              label="NIP"
              name="nip"
              onChange={(event) =>
                setForm((current) => ({ ...current, nip: event.target.value }))
              }
              value={form.nip}
            />
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                htmlFor="status"
              >
                Status
              </label>
              <select
                className="h-11 rounded-md border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                id="status"
                name="status"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as UserPayload['status'],
                  }))
                }
                value={form.status}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <Input
              error={errors.password?.[0]}
              label={selectedUser ? 'Password Baru' : 'Password'}
              name="password"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              type="password"
              value={form.password}
            />
            <Input
              error={errors.password_confirmation?.[0]}
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                <IconUserPlus size={18} />
                Role
              </div>
              <div className="space-y-2">
                {roles.map((role) => (
                  <Checkbox
                    checked={form.selectedRoles.includes(role.name)}
                    key={role.id}
                    label={role.name}
                    onChange={() => toggleRole(role.name)}
                  />
                ))}
              </div>
              {errors.selectedRoles?.[0] ? (
                <p className="mt-2 text-xs text-danger-500">
                  {errors.selectedRoles[0]}
                </p>
              ) : null}
            </div>

            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                <IconUsers size={18} />
                Unit
              </div>
              <div className="space-y-2">
                {units.map((unit) => (
                  <Checkbox
                    checked={form.selectedUnits.includes(unit.id)}
                    key={unit.id}
                    label={unit.unit_name}
                    onChange={() => toggleUnit(unit.id)}
                  />
                ))}
              </div>
              {errors.selectedUnits?.[0] ? (
                <p className="mt-2 text-xs text-danger-500">
                  {errors.selectedUnits[0]}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              label="Batal"
              onClick={() => setModalOpen(false)}
              type="button"
              variant="secondary"
            />
            <Button
              data-testid="user-submit"
              disabled={processing}
              label={processing ? 'Menyimpan...' : 'Simpan'}
              type="submit"
            />
          </div>
        </form>
      </Modal>
    </section>
  )
}
