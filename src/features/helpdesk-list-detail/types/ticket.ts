import type { ApiMeta } from "@/types/api";

export type ApiTicketStatus =
  | "baru"
  | "diklasifikasi"
  | "ditugaskan"
  | "ditolak"
  | "diproses"
  | "eskalasi"
  | "terselesaikan"
  | "ditutup";
export type ApiTicketPriority = "low" | "medium" | "high" | "critical";

export type ApiTicketPerson = {
  id: number;
  name: string;
};

export interface ApiTicketStatusHistory {
  id: number;
  from_status: ApiTicketStatus;
  to_status: ApiTicketStatus;
  changed_by: ApiTicketPerson | null;
  notes: string | null;
  created_at: string;
}

export interface ApiTicketHandling {
  id: number;
  notes: string | null;
  status: string;
  started_at: string;
  completed_at: string;
  handled_by?: {
    id: number;
    name: string;
  } | null;
  result_photo?: {
    original_name: string;
    mime_type: string;
    size: number;
    url: string;
  } | null;
  created_at: string;
}

export interface ApiTicket {
  id: number;
  ticket_number: string;
  service: "tik" | "sarpras";
  category: string | null;
  description: string;
  status: ApiTicketStatus;
  rejection_reason: string | null;
  priority: ApiTicketPriority | null;
  sla_started_at: string | null;

  asset: {
    id: number;
    asset_number: string | null;
    name: string | null;
    brand: string | null;
    location: string | null;
    status: string | null;
    unit?: {
      id: number;
      name: string;
    } | null;
  } | null;

  tik_detail?: {
    quality_category?: {
      id: number;
      name: string;
    } | null;
    it_tag?: {
      id: number;
      name: string;
    } | null;
    custom_it_tag_text?: string | null;
  } | null;

  reporter: {
    id: number;
    name: string;
  };

  unit: {
    id: number;
    name: string;
  };

  assigned_officer: {
    id: number;
    name: string;
  } | null;

  initial_evidence?: {
    original_name: string;
    mime_type: string;
    size: number;
    url?: string;
  } | null;

  completed_at: string | null;
  created_at: string;

  handlings?: ApiTicketHandling[];
  status_histories?: ApiTicketStatusHistory[];
}

// Response dari GET /tickets
export interface TicketCollectionResponse {
  data: ApiTicket[];

  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };

  meta: ApiMeta;
}
