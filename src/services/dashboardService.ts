import api from '@/lib/axios'
import type { DashboardData, DashboardLiveStats } from '@/types/api'

export async function fetchDashboard() {
  const response = await api.get<{ data: DashboardData }>('/dashboard')

  return response.data.data
}

export async function fetchDashboardLiveStats() {
  const response = await api.get<{ data: DashboardLiveStats }>(
    '/dashboard/live-stats',
  )

  return response.data.data
}
