export type TicketStatus = "Baru" | "Terverifikasi" | "Diproses" | "Selesai" | "Ditolak";
export type TicketCategory = "TIK" | "Sarpras" | string;

export interface TicketLog {
  id: string;
  action: string;
  timestamp: string;
  isCompleted?: boolean;
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
  createdAt: string;
  finishedAt?: string;
  attachments?: TicketAttachment[];
  history?: TicketLog[];
}
