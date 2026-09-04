import { create } from 'zustand'
import {
  createUnit as createUnitRequest,
  deleteUnit as deleteUnitRequest,
  fetchUnits as fetchUnitsRequest,
  updateUnit as updateUnitRequest,
} from '@/services/unitService'
import type { ApiMeta, ResourceListQuery, UnitPayload } from '@/types/api'
import type { Unit } from '@/types/auth'

interface UnitStore {
  loading: boolean
  meta: ApiMeta | null
  query: Required<ResourceListQuery>
  units: Unit[]
  createUnit: (payload: UnitPayload) => Promise<string | undefined>
  deleteUnit: (unitId: number | string) => Promise<void>
  loadUnits: () => Promise<void>
  setPage: (page: number) => Promise<void>
  setPerPage: (perPage: number | 'all') => Promise<void>
  setSearch: (search: string) => Promise<void>
  updateUnit: (
    unitId: number,
    payload: UnitPayload,
  ) => Promise<string | undefined>
}

const defaultQuery: Required<ResourceListQuery> = {
  page: 1,
  perPage: 10,
  search: '',
  sort: 'unit_name',
}

export const useUnitStore = create<UnitStore>((set, get) => ({
  loading: true,
  meta: null,
  query: defaultQuery,
  units: [],
  createUnit: async (payload) => {
    const response = await createUnitRequest(payload)
    await get().loadUnits()

    return response.message
  },
  deleteUnit: async (unitId) => {
    await deleteUnitRequest(unitId)
    await get().loadUnits()
  },
  loadUnits: async () => {
    set({ loading: true })

    try {
      const response = await fetchUnitsRequest(get().query)
      set({ meta: response.meta, units: response.data })
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
    await get().loadUnits()
  },
  setPerPage: async (perPage) => {
    set((state) => ({
      query: {
        ...state.query,
        page: 1,
        perPage,
      },
    }))
    await get().loadUnits()
  },
  setSearch: async (search) => {
    set((state) => ({
      query: {
        ...state.query,
        page: 1,
        search,
      },
    }))
    await get().loadUnits()
  },
  updateUnit: async (unitId, payload) => {
    const response = await updateUnitRequest(unitId, payload)
    await get().loadUnits()

    return response.message
  },
}))
