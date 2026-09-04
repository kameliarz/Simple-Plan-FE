import { create } from 'zustand'
import {
  createRole as createRoleRequest,
  deleteRole as deleteRoleRequest,
  fetchPermissions,
  fetchRoles as fetchRolesRequest,
  updateRole as updateRoleRequest,
} from '@/services/roleService'
import type { ApiMeta, ResourceListQuery, RolePayload } from '@/types/api'
import type { Permission, Role } from '@/types/auth'

interface RoleStore {
  loading: boolean
  meta: ApiMeta | null
  permissions: Permission[]
  query: Required<ResourceListQuery>
  roles: Role[]
  createRole: (payload: RolePayload) => Promise<string | undefined>
  deleteRole: (roleIds: number | string) => Promise<void>
  loadRoles: () => Promise<void>
  setPage: (page: number) => Promise<void>
  setPerPage: (perPage: number | 'all') => Promise<void>
  setSearch: (search: string) => Promise<void>
  updateRole: (
    roleId: number,
    payload: RolePayload,
  ) => Promise<string | undefined>
}

const defaultQuery: Required<ResourceListQuery> = {
  page: 1,
  perPage: 10,
  search: '',
  sort: '-created_at',
}

export const useRoleStore = create<RoleStore>((set, get) => ({
  loading: true,
  meta: null,
  permissions: [],
  query: defaultQuery,
  roles: [],
  createRole: async (payload) => {
    const response = await createRoleRequest(payload)
    await get().loadRoles()

    return response.message
  },
  deleteRole: async (roleIds) => {
    await deleteRoleRequest(roleIds)
    await get().loadRoles()
  },
  loadRoles: async () => {
    set({ loading: true })

    try {
      const [rolesResponse, permissions] = await Promise.all([
        fetchRolesRequest(get().query),
        fetchPermissions(),
      ])

      set({
        meta: rolesResponse.meta,
        permissions,
        roles: rolesResponse.data,
      })
    } finally {
      set({ loading: false })
    }
  },
  setPage: async (page) => {
    set((state) => ({
      query: {
        ...state.query,
        page,
      },
    }))
    await get().loadRoles()
  },
  setPerPage: async (perPage) => {
    set((state) => ({
      query: {
        ...state.query,
        page: 1,
        perPage,
      },
    }))
    await get().loadRoles()
  },
  setSearch: async (search) => {
    set((state) => ({
      query: {
        ...state.query,
        page: 1,
        search,
      },
    }))
    await get().loadRoles()
  },
  updateRole: async (roleId, payload) => {
    const response = await updateRoleRequest(roleId, payload)
    await get().loadRoles()

    return response.message
  },
}))
