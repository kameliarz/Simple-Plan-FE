import api from '@/lib/axios'
import type {
  PaginatedResponse,
  ResourceListQuery,
  ResourceResponse,
  UnitPayload,
} from '@/types/api'
import type { Unit } from '@/types/auth'

export async function fetchUnits(query: ResourceListQuery = {}) {
  const response = await api.get<PaginatedResponse<Unit>>('/units', {
    params: {
      include: 'users',
      page: query.page,
      per_page: query.perPage,
      search: query.search || undefined,
      sort: query.sort,
    },
  })

  return response.data
}

export async function createUnit(payload: UnitPayload) {
  const response = await api.post<ResourceResponse<Unit>>('/units', payload)

  return response.data
}

export async function updateUnit(unitId: number, payload: UnitPayload) {
  const response = await api.put<ResourceResponse<Unit>>(
    `/units/${unitId}`,
    payload,
  )

  return response.data
}

export async function deleteUnit(unitId: number | string) {
  await api.delete(`/units/${unitId}`)
}
