import api from '@/lib/axios'
import type {
  PaginatedResponse,
  ResourceResponse,
  ResourceListQuery,
  UserOptionsResponse,
  UserPayload,
} from '@/types/api'
import type { AuthUser, Unit } from '@/types/auth'

export async function fetchUsers(query: ResourceListQuery = {}) {
  const response = await api.get<PaginatedResponse<AuthUser>>('/users', {
    params: {
      include: 'roles,units',
      page: query.page,
      per_page: query.perPage,
      search: query.search || undefined,
      sort: query.sort,
    },
  })

  return response.data
}

export async function fetchUserOptions() {
  const response = await api.get<UserOptionsResponse>('/users/options')
  const units = Array.isArray(response.data.units)
    ? response.data.units
    : response.data.units.data

  return {
    roles: response.data.roles,
    units,
  }
}

export async function createUser(payload: UserPayload) {
  const response = await api.post<ResourceResponse<AuthUser>>('/users', payload)

  return response.data
}

export async function updateUser(userId: number, payload: UserPayload) {
  const response = await api.put<ResourceResponse<AuthUser>>(
    `/users/${userId}`,
    payload,
  )

  return response.data
}

export async function deleteUser(userIds: number | string) {
  await api.delete(`/users/${userIds}`)
}

export function userUnitsLabel(units?: Unit[]) {
  if (!units || units.length === 0) {
    return '-'
  }

  return units.map((unit) => unit.unit_name).join(', ')
}
