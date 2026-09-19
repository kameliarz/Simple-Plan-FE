import type { ApiMeta } from "@/types/api";

export type ApiTicketStatus =
  "baru" | "terverifikasi" | "diproses" | "selesai" | "ditolak" | "diklasifikasi" | "eskalasi";
export type ApiTicketPriority = "low" | "medium" | "high" | "critical";

export interface ApiTicket {
  id: number;
  ticket_number: string;
  service: "tik" | "sarpras";
  category: string | null;
  description: string;
  status: ApiTicketStatus;
  rejection_reason: string | null;
  priority: ApiTicketPriority | null;

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

  initial_evidence: {
    object_key: string;
    original_name: string;
    mime_type: string;
    size: number;
  } | null;

  completed_at: string | null;
  created_at: string;
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
