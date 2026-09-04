import api from '@/lib/axios'
import type {
  NotificationIndexResponse,
  NotificationMutationResponse,
} from '@/types/api'

export async function fetchNotifications() {
  const response = await api.get<NotificationIndexResponse>('/notifications')

  return response.data
}

export async function markNotificationAsRead(notificationId: string) {
  const response = await api.patch<NotificationMutationResponse>(
    `/notifications/${notificationId}/read`,
  )

  return response.data
}

export async function markAllNotificationsAsRead() {
  const response =
    await api.patch<NotificationMutationResponse>('/notifications/read-all')

  return response.data
}
