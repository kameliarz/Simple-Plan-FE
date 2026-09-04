import { create } from 'zustand'
import {
  createBackup as createBackupRequest,
  deleteBackup as deleteBackupRequest,
  fetchBackups,
  updateBackupSchedule as updateBackupScheduleRequest,
} from '@/services/backupService'
import type {
  BackupFile,
  BackupIndexData,
  BackupScheduleConfig,
} from '@/types/api'

interface BackupStore {
  backups: BackupFile[]
  createBackup: () => Promise<string>
  deleteBackup: (path: string) => Promise<string>
  loadBackups: () => Promise<void>
  loading: boolean
  scheduleConfig: BackupScheduleConfig
  updateSchedule: (payload: BackupScheduleConfig) => Promise<string>
}

const defaultSchedule: BackupScheduleConfig = {
  frequency: 'none',
  time: '00:00',
}

function applyBackupData(data: BackupIndexData) {
  return {
    backups: data.backups,
    scheduleConfig: data.schedule_config,
  }
}

export const useBackupStore = create<BackupStore>((set) => ({
  backups: [],
  createBackup: async () => {
    const response = await createBackupRequest()
    set(applyBackupData(response.data))

    return response.message
  },
  deleteBackup: async (path) => {
    const response = await deleteBackupRequest(path)
    set(applyBackupData(response.data))

    return response.message
  },
  loadBackups: async () => {
    set({ loading: true })

    try {
      const data = await fetchBackups()
      set(applyBackupData(data))
    } finally {
      set({ loading: false })
    }
  },
  loading: true,
  scheduleConfig: defaultSchedule,
  updateSchedule: async (payload) => {
    const response = await updateBackupScheduleRequest(payload)
    set({ scheduleConfig: response.data })

    return response.message
  },
}))
