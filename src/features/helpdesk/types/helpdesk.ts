export type TicketStatus = "Baru" | "Diklasifikasi" | "Ditugaskan" | "Diproses" | "Eskalasi" | "Terselesaikan" | "Terverifikasi" | "Ditutup" | "Ditolak";
export type TicketCategory = "TIK" | "Sarpras" | "Ketidakstabilan System" | string;

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
  inventaris?: {
    no: string;
    name: string;
    merk: string;
    unit: string;
    lokasi: string;
  };
  createdAt: string;
  finishedAt?: string;
  attachments?: TicketAttachment[];
  history?: TicketLog[];
  priority?: "Critical" | "High" | "Medium" | "Low";
  resolutionNotes?: string;
  resolutionAttachments?: TicketAttachment[];
}
