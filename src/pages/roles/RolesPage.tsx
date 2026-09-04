import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import {
  IconEdit,
  IconPlus,
  IconShield,
  IconTrash,
  IconUserShield,
} from '@tabler/icons-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'
import PermissionPicker from '@/components/ui/PermissionPicker'
import ResourceToolbar from '@/components/ui/ResourceToolbar'
import Table from '@/components/ui/Table'
import { useBulkSelect } from '@/hooks/useBulkSelect'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { useRoleStore } from '@/stores/roleStore'
import type { RolePayload } from '@/types/api'
import type { Role } from '@/types/auth'
import { getApiErrorMessage, getValidationErrors } from '@/utils/apiErrors'

const emptyForm: RolePayload = {
  name: '',
  permissions: [],
}

export default function RolesPage() {
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [form, setForm] = useState<RolePayload>(emptyForm)
  const [modalOpen, setModalOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const createRole = useRoleStore((state) => state.createRole)
  const deleteRole = useRoleStore((state) => state.deleteRole)
  const loadRoles = useRoleStore((state) => state.loadRoles)
  const loading = useRoleStore((state) => state.loading)
  const meta = useRoleStore((state) => state.meta)
  const permissions = useRoleStore((state) => state.permissions)
  const query = useRoleStore((state) => state.query)
  const roles = useRoleStore((state) => state.roles)
  const setPage = useRoleStore((state) => state.setPage)
  const setPerPage = useRoleStore((state) => state.setPerPage)
  const setSearch = useRoleStore((state) => state.setSearch)
  const updateRole = useRoleStore((state) => state.updateRole)
  const { clear, isAllSelected, isSelected, selected, toggle, toggleAll } =
    useBulkSelect(roles)
  const { confirmDelete: confirmDeleteAction } = useDeleteConfirm()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadRoles().catch((error: unknown) => {
        toast.error(getApiErrorMessage(error))
      })
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadRoles])

  const openCreateModal = () => {
    setSelectedRole(null)
    setForm(emptyForm)
    setErrors({})
    setModalOpen(true)
  }

  const openEditModal = (role: Role) => {
    setSelectedRole(role)
    setForm({
      name: role.name,
      permissions: role.permissions?.map((permission) => permission.id) ?? [],
    })
    setErrors({})
    setModalOpen(true)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProcessing(true)
    setErrors({})

    try {
      const message = selectedRole
        ? await updateRole(selectedRole.id, form)
        : await createRole(form)

      toast.success(message ?? 'Akses group tersimpan.')
      setModalOpen(false)
    } catch (error) {
      setErrors(getValidationErrors(error))
      toast.error(getApiErrorMessage(error))
    } finally {
      setProcessing(false)
    }
  }

  const confirmDelete = (role: Role) =>
    confirmDeleteAction({
      onConfirm: async () => {
        await deleteRole(role.id)
        clear()
        toast.success('Akses group berhasil dihapus.')
      },
      text: `Akses group ${role.name} akan dihapus.`,
      title: 'Hapus akses group?',
    }).catch((error: unknown) => {
      toast.error(getApiErrorMessage(error))
    })

  const confirmBulkDelete = () =>
    confirmDeleteAction({
      confirmText: 'Hapus Semua',
      onConfirm: async () => {
        await deleteRole(selected.join(','))
        clear()
        toast.success('Akses group terpilih berhasil dihapus.')
      },
      text: `${selected.length} akses group akan dihapus.`,
      title: 'Hapus akses group terpilih?',
    }).catch((error: unknown) => {
      toast.error(getApiErrorMessage(error))
    })

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
            Akses Group
          </h1>
          <p className="text-sm text-slate-500">
            Kelola role dan permission untuk kontrol akses aplikasi.
          </p>
        </div>
        <Button
          data-testid="role-create-open"
          icon={<IconPlus size={18} />}
          label="Tambah Group"
          onClick={openCreateModal}
        />
      </div>

      <div>
        <Table.Card
          icon={<IconUserShield size={18} />}
          title={`Daftar Akses Group (${meta?.total ?? roles.length})`}
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
          searchPlaceholder="Cari akses group..."
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
        <Table data-testid="roles-table">
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
              <Table.Th>Nama Group</Table.Th>
              <Table.Th>Permission</Table.Th>
              <Table.Th className="w-32 text-right">Aksi</Table.Th>
            </tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Empty colSpan={4} message="Memuat data akses group..." />
            ) : roles.length === 0 ? (
              <Table.Empty colSpan={4} message="Belum ada akses group." />
            ) : (
              roles.map((role) => (
                <tr key={role.id}>
                  <Table.Td>
                    <input
                      checked={isSelected(role.id)}
                      className="rounded border-slate-300 text-primary-600 shadow-sm focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900"
                      onChange={() => toggle(role.id)}
                      type="checkbox"
                    />
                  </Table.Td>
                  <Table.Td className="font-medium text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <IconUserShield size={18} strokeWidth={1.5} />
                      {role.name}
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <div className="flex max-w-3xl flex-wrap gap-1.5">
                      {role.permissions?.slice(0, 8).map((permission) => (
                        <span
                          className="inline-flex items-center gap-1 rounded-md bg-accent-50 px-2 py-1 text-xs font-medium text-accent-700 dark:bg-accent-950/40 dark:text-accent-300"
                          key={permission.id}
                        >
                          <IconShield size={12} strokeWidth={1.5} />
                          {permission.name}
                        </span>
                      ))}
                      {(role.permissions?.length ?? 0) > 8 ? (
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800">
                          +{(role.permissions?.length ?? 0) - 8} lainnya
                        </span>
                      ) : null}
                      {(role.permissions?.length ?? 0) === 0 ? '-' : null}
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <div className="flex justify-end gap-2">
                      <Button
                        data-testid={`role-edit-${role.id}`}
                        icon={<IconEdit size={16} />}
                        onClick={() => openEditModal(role)}
                        size="icon"
                        variant="secondary"
                      />
                      <Button
                        data-testid={`role-delete-${role.id}`}
                        icon={<IconTrash size={16} />}
                        onClick={() => void confirmDelete(role)}
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
        title={selectedRole ? 'Edit Akses Group' : 'Tambah Akses Group'}
      >
        <form className="space-y-5" data-testid="role-form" onSubmit={submit}>
          <Input
            autoFocus
            error={errors.name?.[0]}
            label="Nama Group"
            name="name"
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Contoh: manager"
            value={form.name}
          />

          <PermissionPicker
            error={errors.permissions?.[0] ?? errors.selectedPermission?.[0]}
            onChange={(permissionIds) =>
              setForm((current) => ({
                ...current,
                permissions: permissionIds,
              }))
            }
            permissions={permissions}
            selected={form.permissions}
          />

          <div className="flex justify-end gap-2">
            <Button
              label="Batal"
              onClick={() => setModalOpen(false)}
              type="button"
              variant="secondary"
            />
            <Button
              data-testid="role-submit"
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
