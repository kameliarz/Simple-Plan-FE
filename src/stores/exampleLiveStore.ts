import { create } from 'zustand'
import {
  fetchExampleLiveMetadata,
  fetchExampleMarketData,
  fetchExampleTaskStatus,
  startExampleTask,
} from '@/services/exampleLiveService'
import type {
  ExampleLiveMetadata,
  ExampleMarketData,
  ExampleMarketRange,
  ExampleTaskStatus,
} from '@/types/api'

interface ExampleLiveStore {
  loadingMarket: boolean
  loadingMetadata: boolean
  market: ExampleMarketData | null
  metadata: ExampleLiveMetadata | null
  selectedRange: ExampleMarketRange
  taskId: string | null
  taskStatus: ExampleTaskStatus | null
  loadMarket: (range?: ExampleMarketRange) => Promise<void>
  loadMetadata: () => Promise<void>
  loadTaskStatus: () => Promise<void>
  setRange: (range: ExampleMarketRange) => Promise<void>
  startTask: (steps: number) => Promise<string>
}

export const useExampleLiveStore = create<ExampleLiveStore>((set, get) => ({
  loadingMarket: true,
  loadingMetadata: true,
  market: null,
  metadata: null,
  selectedRange: 'live',
  taskId: null,
  taskStatus: null,
  loadMetadata: async () => {
    set({ loadingMetadata: true })

    try {
      const metadata = await fetchExampleLiveMetadata()
      set({ metadata })
    } finally {
      set({ loadingMetadata: false })
    }
  },
  loadMarket: async (range) => {
    const selectedRange = range ?? get().selectedRange
    set({ loadingMarket: true })

    try {
      const market = await fetchExampleMarketData(selectedRange)
      set({ market, selectedRange })
    } finally {
      set({ loadingMarket: false })
    }
  },
  loadTaskStatus: async () => {
    const taskId = get().taskId

    if (!taskId) {
      return
    }

    const taskStatus = await fetchExampleTaskStatus(taskId)
    set({ taskStatus })
  },
  setRange: async (range) => {
    set({ selectedRange: range })
    await get().loadMarket(range)
  },
  startTask: async (steps) => {
    const response = await startExampleTask(steps)
    set({
      taskId: response.taskId,
      taskStatus: {
        message: response.message,
        progress: 0,
        status: 'pending',
      },
    })

    return response.message
  },
}))
