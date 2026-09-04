import { create } from 'zustand'
import {
  createUser as createUserRequest,
  deleteUser as deleteUserRequest,
  fetchUserOptions,
  fetchUsers as fetchUsersRequest,
  updateUser as updateUserRequest,
} from '@/services/userService'
import type { ApiMeta, ResourceListQuery, UserPayload } from '@/types/api'
import type { AuthUser, Role, Unit } from '@/types/auth'

interface UserStore {
  loading: boolean
  meta: ApiMeta | null
  query: Required<ResourceListQuery>
  roles: Pick<Role, 'id' | 'name'>[]
  units: Unit[]
  users: AuthUser[]
  createUser: (payload: UserPayload) => Promise<string | undefined>
  deleteUser: (userIds: number | string) => Promise<void>
  loadUsers: () => Promise<void>
  setPage: (page: number) => Promise<void>
  setPerPage: (perPage: number | 'all') => Promise<void>
  setSearch: (search: string) => Promise<void>
  updateUser: (
    userId: number,
    payload: UserPayload,
  ) => Promise<string | undefined>
}

const defaultQuery: Required<ResourceListQuery> = {
  page: 1,
  perPage: 10,
  search: '',
  sort: '-created_at',
}

export const useUserStore = create<UserStore>((set, get) => ({
  loading: true,
  meta: null,
  query: defaultQuery,
  roles: [],
  units: [],
  users: [],
  createUser: async (payload) => {
    const response = await createUserRequest(payload)
    await get().loadUsers()

    return response.message
  },
  deleteUser: async (userIds) => {
    await deleteUserRequest(userIds)
    await get().loadUsers()
  },
  loadUsers: async () => {
    set({ loading: true })

    try {
      const [usersResponse, optionsResponse] = await Promise.all([
        fetchUsersRequest(get().query),
        fetchUserOptions(),
      ])

      set({
        meta: usersResponse.meta,
        roles: optionsResponse.roles,
        units: optionsResponse.units,
        users: usersResponse.data,
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
    await get().loadUsers()
  },
  setPerPage: async (perPage) => {
    set((state) => ({
      query: {
        ...state.query,
        page: 1,
        perPage,
      },
    }))
    await get().loadUsers()
  },
  setSearch: async (search) => {
    set((state) => ({
      query: {
        ...state.query,
        page: 1,
        search,
      },
    }))
    await get().loadUsers()
  },
  updateUser: async (userId, payload) => {
    const response = await updateUserRequest(userId, payload)
    await get().loadUsers()

    return response.message
  },
}))
