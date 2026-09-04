import api from '@/lib/axios'
import type {
  PaginatedResponse,
  PermissionsResponse,
  ResourceListQuery,
  ResourceResponse,
  RolePayload,
} from '@/types/api'
import type { Permission, Role } from '@/types/auth'

export async function fetchRoles(query: ResourceListQuery = {}) {
  const response = await api.get<PaginatedResponse<Role>>('/roles', {
    params: {
      include: 'permissions',
      page: query.page,
      per_page: query.perPage,
      search: query.search || undefined,
      sort: query.sort,
    },
  })

  return response.data
}

export async function fetchPermissions() {
  const response = await api.get<PermissionsResponse>('/roles/permissions')

  return response.data.data
}

export async function createRole(payload: RolePayload) {
  const response = await api.post<ResourceResponse<Role>>('/roles', payload)

  return response.data
}

export async function updateRole(roleId: number, payload: RolePayload) {
  const response = await api.put<ResourceResponse<Role>>(
    `/roles/${roleId}`,
    payload,
  )

  return response.data
}

export async function deleteRole(roleIds: number | string) {
  await api.delete(`/roles/${roleIds}`)
}

export function groupPermissions(permissions: Permission[]) {
  return permissions.reduce<Record<string, Permission[]>>((groups, permission) => {
    const [moduleName = 'lainnya'] = permission.name.split('-')
    const label = moduleName.charAt(0).toUpperCase() + moduleName.slice(1)

    groups[label] = [...(groups[label] ?? []), permission]

    return groups
  }, {})
}
