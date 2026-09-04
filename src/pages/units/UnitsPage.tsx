import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { IconBuilding, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'
import ResourceToolbar from '@/components/ui/ResourceToolbar'
import Table from '@/components/ui/Table'
import TextArea from '@/components/ui/TextArea'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { useUnitStore } from '@/stores/unitStore'
import type { UnitPayload } from '@/types/api'
import type { Unit } from '@/types/auth'
import { getApiErrorMessage, getValidationErrors } from '@/utils/apiErrors'

const emptyForm: UnitPayload = {
  description: '',
  unit_name: '',
}

export default function UnitsPage() {
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [form, setForm] = useState<UnitPayload>(emptyForm)
  const [modalOpen, setModalOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const createUnit = useUnitStore((state) => state.createUnit)
  const deleteUnit = useUnitStore((state) => state.deleteUnit)
  const loadUnits = useUnitStore((state) => state.loadUnits)
  const loading = useUnitStore((state) => state.loading)
  const meta = useUnitStore((state) => state.meta)
  const query = useUnitStore((state) => state.query)
  const setPage = useUnitStore((state) => state.setPage)
  const setPerPage = useUnitStore((state) => state.setPerPage)
  const setSearch = useUnitStore((state) => state.setSearch)
  const units = useUnitStore((state) => state.units)
  const updateUnit = useUnitStore((state) => state.updateUnit)
  const { confirmDelete: confirmDeleteAction } = useDeleteConfirm()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadUnits().catch((error: unknown) => {
        toast.error(getApiErrorMessage(error))
      })
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadUnits])

  const openCreateModal = () => {
    setSelectedUnit(null)
    setForm(emptyForm)
    setErrors({})
    setModalOpen(true)
  }

  const openEditModal = (unit: Unit) => {
    setSelectedUnit(unit)
    setForm({
      description: unit.description ?? '',
      unit_name: unit.unit_name,
    })
    setErrors({})
    setModalOpen(true)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProcessing(true)
    setErrors({})

    try {
      const message = selectedUnit
        ? await updateUnit(selectedUnit.id, form)
        : await createUnit(form)

      toast.success(message ?? 'Data unit tersimpan.')
      setModalOpen(false)
    } catch (error) {
      setErrors(getValidationErrors(error))
      toast.error(getApiErrorMessage(error))
    } finally {
      setProcessing(false)
    }
  }

  const confirmDelete = (unit: Unit) =>
    confirmDeleteAction({
      onConfirm: async () => {
        await deleteUnit(unit.id)
        toast.success('Unit berhasil dihapus.')
      },
      text: `Unit ${unit.unit_name} akan dihapus.`,
      title: 'Hapus unit?',
    }).catch((error: unknown) => {
      toast.error(getApiErrorMessage(error))
    })

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
            Manajemen Unit
          </h1>
          <p className="text-sm text-slate-500">
            Kelola departemen dan unit kerja.
          </p>
        </div>
        <Button
          data-testid="unit-create-open"
          icon={<IconPlus size={18} />}
          label="Tambah Unit"
          onClick={openCreateModal}
        />
      </div>

      <div>
        <Table.Card
          icon={<IconBuilding size={18} />}
          title={`Daftar Unit (${meta?.total ?? units.length})`}
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
          searchPlaceholder="Cari unit..."
        />
        <Table data-testid="units-table">
          <Table.Thead>
            <tr>
              <Table.Th>Nama Unit</Table.Th>
              <Table.Th>Deskripsi</Table.Th>
              <Table.Th>Jumlah User</Table.Th>
              <Table.Th className="w-32 text-right">Aksi</Table.Th>
            </tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Empty colSpan={4} message="Memuat data unit..." />
            ) : units.length === 0 ? (
              <Table.Empty colSpan={4} message="Belum ada unit." />
            ) : (
              units.map((unit) => (
                <tr key={unit.id}>
                  <Table.Td className="font-medium text-slate-900 dark:text-slate-100">
                    {unit.unit_name}
                  </Table.Td>
                  <Table.Td>{unit.description ?? '-'}</Table.Td>
                  <Table.Td>{unit.users_count ?? unit.users?.length ?? 0}</Table.Td>
                  <Table.Td>
                    <div className="flex justify-end gap-2">
                      <Button
                        data-testid={`unit-edit-${unit.id}`}
                        icon={<IconEdit size={16} />}
                        onClick={() => openEditModal(unit)}
                        size="icon"
                        variant="secondary"
                      />
                      <Button
                        data-testid={`unit-delete-${unit.id}`}
                        icon={<IconTrash size={16} />}
                        onClick={() => void confirmDelete(unit)}
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
        maxWidth="lg"
        onClose={() => setModalOpen(false)}
        show={modalOpen}
        title={selectedUnit ? 'Edit Unit' : 'Tambah Unit'}
      >
        <form className="space-y-4" data-testid="unit-form" onSubmit={submit}>
          <Input
            autoFocus
            error={errors.unit_name?.[0]}
            label="Nama Unit"
            name="unit_name"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                unit_name: event.target.value,
              }))
            }
            value={form.unit_name}
          />
          <TextArea
            error={errors.description?.[0]}
            label="Deskripsi"
            name="description"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            value={form.description ?? ''}
          />
          <div className="flex justify-end gap-2">
            <Button
              label="Batal"
              onClick={() => setModalOpen(false)}
              type="button"
              variant="secondary"
            />
            <Button
              data-testid="unit-submit"
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
