import { create } from 'zustand'
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/services/notificationService'
import type { AppNotification } from '@/types/api'

interface NotificationStore {
  activity: AppNotification[]
  loading: boolean
  notifications: AppNotification[]
  unreadCount: number
  loadNotifications: () => Promise<void>
  markAllAsRead: () => Promise<string>
  markAsRead: (notificationId: string) => Promise<string>
  reset: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  activity: [],
  loading: false,
  notifications: [],
  unreadCount: 0,
  loadNotifications: async () => {
    set({ loading: true })

    try {
      const response = await fetchNotifications()
      set({
        activity: response.activity,
        notifications: response.data,
        unreadCount: response.unread_count,
      })
    } finally {
      set({ loading: false })
    }
  },
  markAllAsRead: async () => {
    const response = await markAllNotificationsAsRead()
    set({
      notifications: response.data,
      unreadCount: response.unread_count,
    })

    return response.message
  },
  markAsRead: async (notificationId) => {
    const response = await markNotificationAsRead(notificationId)
    set({
      notifications: response.data,
      unreadCount: response.unread_count,
    })

    return response.message
  },
  reset: () =>
    set({
      activity: [],
      loading: false,
      notifications: [],
      unreadCount: 0,
    }),
}))
