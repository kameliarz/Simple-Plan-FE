export type NotificationCategory = "aset" | "peminjaman" | "sistem";

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  category: NotificationCategory;
  isRead: boolean;
}

export interface NotificationApi {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  time: string;
  read_at: string | null;
  created_at: string;
}

export interface NotificationActivityApi {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  time: string;
}

export interface NotificationResponse {
  data: NotificationApi[];
  unread_count: number;
  activity: NotificationActivityApi[];
}
