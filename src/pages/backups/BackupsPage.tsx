import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import {
  IconAlertTriangle,
  IconClock,
  IconDatabase,
  IconDownload,
  IconList,
  IconPlus,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import Table from '@/components/ui/Table'
import { downloadBackup } from '@/services/backupService'
import { useBackupStore } from '@/stores/backupStore'
import type {
  BackupFile,
  BackupScheduleConfig,
  BackupScheduleFrequency,
} from '@/types/api'
import { getApiErrorMessage, getValidationErrors } from '@/utils/apiErrors'
import { cn } from '@/utils/cn'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'

const tabs = [
  { icon: IconList, name: 'Daftar Backup' },
  { icon: IconClock, name: 'Jadwal Otomatis' },
]

const frequencyOptions: Array<{
  label: string
  value: BackupScheduleFrequency
}> = [
  { label: 'Tidak Ada', value: 'none' },
  { label: 'Setiap Hari', value: 'daily' },
  { label: 'Setiap Minggu', value: 'weekly' },
  { label: 'Setiap Bulan', value: 'monthly' },
]

const frequencyLabels: Record<BackupScheduleFrequency, string> = {
  daily: 'Setiap hari',
  monthly: 'Setiap bulan',
  none: 'Tidak aktif',
  weekly: 'Setiap minggu',
}

export default function BackupsPage() {
  const backups = useBackupStore((state) => state.backups)
  const createBackup = useBackupStore((state) => state.createBackup)
  const deleteBackupFile = useBackupStore((state) => state.deleteBackup)
  const loadBackups = useBackupStore((state) => state.loadBackups)
  const loading = useBackupStore((state) => state.loading)
  const scheduleConfig = useBackupStore((state) => state.scheduleConfig)
  const updateSchedule = useBackupStore((state) => state.updateSchedule)
  const { confirmDelete } = useDeleteConfirm()
  const [creating, setCreating] = useState(false)
  const [downloadingPath, setDownloadingPath] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [scheduleForm, setScheduleForm] =
    useState<BackupScheduleConfig>(scheduleConfig)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadBackups()
        .then(() => {
          setScheduleForm(useBackupStore.getState().scheduleConfig)
        })
        .catch((error: unknown) => {
          toast.error(getApiErrorMessage(error))
        })
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadBackups])

  const handleCreateBackup = async () => {
    setCreating(true)

    try {
      const message = await createBackup()
      toast.success(message)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setCreating(false)
    }
  }

  const handleDownload = async (backup: BackupFile) => {
    setDownloadingPath(backup.path)

    try {
      await downloadBackup(backup)
      toast.success('File backup siap diunduh.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setDownloadingPath(null)
    }
  }

  const handleDelete = (backup: BackupFile) =>
    confirmDelete({
      confirmText: 'Hapus File',
      onConfirm: async () => {
        const message = await deleteBackupFile(backup.path)
        toast.success(message)
      },
      text: `File ${backup.name} akan dihapus permanen.`,
      title: 'Hapus backup?',
    }).catch((error: unknown) => {
      toast.error(getApiErrorMessage(error))
    })

  const handleSaveSchedule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    setSavingSchedule(true)

    try {
      const message = await updateSchedule(scheduleForm)
      toast.success(message)
    } catch (error) {
      setErrors(getValidationErrors(error))
      toast.error(getApiErrorMessage(error))
    } finally {
      setSavingSchedule(false)
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
            Backup Database
          </h1>
          <p className="text-sm text-slate-500">
            Kelola backup manual, unduhan file, dan jadwal otomatis.
          </p>
        </div>
        <Button
          disabled={creating}
          icon={<IconPlus size={18} />}
          label={creating ? 'Membuat Backup...' : 'Buat Backup Manual'}
          onClick={() => void handleCreateBackup()}
          type="button"
        />
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
            <Table.Card
              icon={<IconDatabase size={18} />}
              title={`Daftar Backup (${backups.length})`}
            />
            <Table data-testid="backups-table">
              <Table.Thead>
                <tr>
                  <Table.Th>Nama File</Table.Th>
                  <Table.Th>Ukuran</Table.Th>
                  <Table.Th>Tanggal Dibuat</Table.Th>
                  <Table.Th className="w-40 text-right">Aksi</Table.Th>
                </tr>
              </Table.Thead>
              <Table.Tbody>
                {loading ? (
                  <Table.Empty colSpan={4} message="Memuat daftar backup..." />
                ) : backups.length === 0 ? (
                  <Table.Empty colSpan={4} message="Belum ada backup.">
                    <IconDatabase
                      className="mx-auto text-slate-300"
                      size={36}
                      strokeWidth={1.5}
                    />
                  </Table.Empty>
                ) : (
                  backups.map((backup) => (
                    <tr key={backup.path}>
                      <Table.Td className="font-medium text-slate-900 dark:text-slate-100">
                        {backup.name}
                      </Table.Td>
                      <Table.Td>{backup.size}</Table.Td>
                      <Table.Td>{backup.date}</Table.Td>
                      <Table.Td>
                        <div className="flex justify-end gap-2">
                          <Button
                            disabled={downloadingPath === backup.path}
                            icon={<IconDownload size={16} />}
                            onClick={() => void handleDownload(backup)}
                            size="icon"
                            type="button"
                            variant="secondary"
                          />
                          <Button
                            icon={<IconTrash size={16} />}
                            onClick={() => void handleDelete(backup)}
                            size="icon"
                            type="button"
                            variant="danger"
                          />
                        </div>
                      </Table.Td>
                    </tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </TabPanel>

          <TabPanel>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
              <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <header>
                  <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                    Jadwal Backup
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Scheduler Laravel akan membaca konfigurasi ini saat
                    `php artisan schedule:run` berjalan.
                  </p>
                </header>

                <form className="mt-6 space-y-5" onSubmit={handleSaveSchedule}>
                  <div className="flex flex-col gap-2">
                    <label
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      htmlFor="frequency"
                    >
                      Frekuensi Backup
                    </label>
                    <select
                      className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      id="frequency"
                      onChange={(event) =>
                        setScheduleForm((current) => ({
                          ...current,
                          frequency: event.target.value as BackupScheduleFrequency,
                        }))
                      }
                      value={scheduleForm.frequency}
                    >
                      {frequencyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.frequency?.[0] ? (
                      <small className="text-xs text-danger-500">
                        {errors.frequency[0]}
                      </small>
                    ) : null}
                  </div>

                  {scheduleForm.frequency !== 'none' ? (
                    <Input
                      error={errors.time?.[0]}
                      label="Waktu Eksekusi"
                      name="time"
                      onChange={(event) =>
                        setScheduleForm((current) => ({
                          ...current,
                          time: event.target.value,
                        }))
                      }
                      type="time"
                      value={scheduleForm.time}
                    />
                  ) : null}

                  <Button
                    disabled={savingSchedule}
                    icon={<IconSettings size={18} />}
                    label={savingSchedule ? 'Menyimpan...' : 'Simpan Jadwal'}
                    type="submit"
                  />
                </form>
              </section>

              <EmptyState
                description="Pastikan cron server menjalankan schedule Laravel agar backup otomatis benar-benar dieksekusi."
                icon={IconAlertTriangle}
                title="Status Jadwal"
              >
                <div className="rounded-md bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {frequencyLabels[scheduleConfig.frequency]} pada{' '}
                  {scheduleConfig.time}
                </div>
              </EmptyState>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </section>
  )
}
