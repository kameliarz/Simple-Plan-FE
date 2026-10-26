import { getToken } from "@/features/auth-login/services/authStorage";

import type {
  Notification,
  NotificationApi,
  NotificationResponse,
} from "../types/notification.types";

const BASE_URL = "http://localhost:8000/api/v1";

export const notificationService = {
  getNotifications: async (): Promise<NotificationResponse> => {
    const token = getToken();

    const response = await fetch(`${BASE_URL}/notifications`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Gagal mengambil notifikasi. Status: ${response.status}`);
    }

    return response.json() as Promise<NotificationResponse>;
  },

  markAsRead: async (id: string): Promise<void> => {
    const token = getToken();

    const response = await fetch(`${BASE_URL}/notifications/${encodeURIComponent(id)}/read`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      throw new Error(
        errorData?.message || `Gagal menandai notifikasi. Status: ${response.status}`,
      );
    }
  },
};

export function mapNotification(notification: NotificationApi): Notification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.subtitle,
    createdAt: new Date(notification.created_at).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }),
    createdAtRaw: notification.created_at,
    category: "sistem",
    isRead: notification.is_read,
    url: notification.url,
  };
}
