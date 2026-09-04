import { create } from 'zustand'
import {
  fetchDashboard,
  fetchDashboardLiveStats,
} from '@/services/dashboardService'
import type { DashboardData, DashboardLiveStats } from '@/types/api'

interface DashboardStore {
  data: DashboardData | null
  liveStats: DashboardLiveStats | null
  loading: boolean
  loadDashboard: () => Promise<void>
  loadLiveStats: () => Promise<void>
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  data: null,
  liveStats: null,
  loading: true,
  loadDashboard: async () => {
    set({ loading: true })

    try {
      const data = await fetchDashboard()

      set({ data })
    } finally {
      set({ loading: false })
    }
  },
  loadLiveStats: async () => {
    const liveStats = await fetchDashboardLiveStats()

    set({ liveStats })
  },
}))
