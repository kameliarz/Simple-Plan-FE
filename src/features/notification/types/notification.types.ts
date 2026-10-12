export type NotificationCategory = "aset" | "peminjaman" | "sistem";

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  category: NotificationCategory;
  isRead: boolean;
}
