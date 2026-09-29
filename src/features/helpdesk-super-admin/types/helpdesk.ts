export type TicketStatus =
  "Baru" | "Diklasifikasi" | "Ditolak" | "Diproses" | "Eskalasi" | "Terselesaikan" | "Ditutup";
export type TicketPriority = "Low" | "Medium" | "High" | "Critical";
export type TicketCategory = "TIK" | "Sarpras" | string;

export interface TicketLog {
  id: string;
  action: string;
  timestamp: string;
  isCompleted?: boolean;

  handlingNote?: string;

  handlingPhoto?: {
    name: string;
    size: string;
    url: string;
  };

  retryNote?: string;
  rejectionReason?: string;
}

export interface TicketAttachment {
  id: string;
  name: string;
  size: string;
  url: string;
  previewUrl?: string;
}

export interface TicketItem {
  id: string;
  code: string;
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority | null;
  sla_started_at: string | null;
  reporter: {
    name: string;
    unit: string;
    avatarInitials?: string;
    avatarUrl?: string;
  };
  assignee?: {
    name: string;
    role: string;
    avatarInitials?: string;
  };
  started_at?: string | null;
  createdAt: string;
  finishedAt?: string;
  attachments?: TicketAttachment[];
  history?: TicketLog[];
}
