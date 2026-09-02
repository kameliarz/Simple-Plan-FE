export type TicketStatus = 'Baru' | 'Diproses' | 'Selesai';
export type TicketCategory = 'TIK' | 'Sarpras';

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