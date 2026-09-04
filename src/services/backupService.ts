import api from '@/lib/axios'
import type {
  BackupFile,
  BackupIndexResponse,
  BackupMutationResponse,
  BackupScheduleConfig,
} from '@/types/api'

export async function fetchBackups() {
  const response = await api.get<BackupIndexResponse>('/backups')

  return response.data.data
}

export async function createBackup() {
  const response = await api.post<BackupMutationResponse>('/backups')

  return response.data
}

export async function updateBackupSchedule(payload: BackupScheduleConfig) {
  const response = await api.post<BackupMutationResponse<BackupScheduleConfig>>(
    '/backups/schedule',
    payload,
  )

  return response.data
}

export async function deleteBackup(path: string) {
  const response = await api.delete<BackupMutationResponse>('/backups', {
    data: { path },
  })

  return response.data
}

export async function downloadBackup(backup: BackupFile) {
  const response = await api.get<Blob>('/backups/download', {
    params: { path: backup.path },
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(response.data)
  const link = document.createElement('a')

  link.href = url
  link.download = backup.name
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
