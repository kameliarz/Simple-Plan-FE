import api from '@/lib/axios'
import type {
  ImpersonationStartResponse,
  ImpersonationStatusResponse,
  ImpersonationStopResponse,
} from '@/types/api'

export async function startImpersonation(userId: number) {
  const response = await api.post<ImpersonationStartResponse>(
    `/impersonation/${userId}/start`,
  )

  return response.data
}

export async function stopImpersonation() {
  const response = await api.post<ImpersonationStopResponse>(
    '/impersonation/stop',
  )

  return response.data
}

export async function fetchImpersonationStatus() {
  const response =
    await api.get<ImpersonationStatusResponse>('/impersonation/status')

  return response.data.data
}
