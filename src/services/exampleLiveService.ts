import api from '@/lib/axios'
import type {
  ExampleLiveMetadata,
  ExampleMarketData,
  ExampleMarketRange,
  ExampleTaskStartResponse,
  ExampleTaskStatus,
  ResourceResponse,
} from '@/types/api'

export async function fetchExampleLiveMetadata() {
  const response =
    await api.get<ResourceResponse<ExampleLiveMetadata>>('/example-live')

  return response.data.data
}

export async function fetchExampleMarketData(range: ExampleMarketRange) {
  const response = await api.get<ExampleMarketData>(
    '/example-live/real-market',
    {
      params: { range },
    },
  )

  return response.data
}

export async function startExampleTask(steps: number) {
  const response = await api.post<ExampleTaskStartResponse>(
    '/example-live/start',
    { steps },
  )

  return response.data
}

export async function fetchExampleTaskStatus(taskId: string) {
  const response = await api.get<ExampleTaskStatus>(
    `/example-live/status/${taskId}`,
  )

  return response.data
}
