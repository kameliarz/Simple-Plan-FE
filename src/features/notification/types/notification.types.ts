export type NotificationCategory = "aset" | "peminjaman" | "sistem";

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  category: NotificationCategory;
  isRead: boolean;
  url?: string | null;
  createdAtRaw: string;
}
export interface NotificationTarget {
  feature: string;
  subfeature: string | null;
  resource_id: string | number | null;
}

export interface NotificationApi {
  id: string;
  title: string;
  subtitle: string;
  ticket_id: string | null;
  nomor_tiket: string | null;
  target?: NotificationTarget | null;
  url: string | null;
  is_read: boolean;
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
  current_page: number;
  last_page: number;
  total: number;
}
