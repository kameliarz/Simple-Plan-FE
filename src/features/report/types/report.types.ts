export type ReportModule = "helpdesk" | "inventaris" | "maintenance" | "desain-grafis";

export type TicketStatus =
  "Baru" | "Diklasisfikasikan" | "Diproses" | "Eskalasi" | "Terselesaikan" | "Selesai" | "Ditolak";

export interface ReportTicket {
  id: string;
  createdAt: string;
  module: ReportModule;
  service: string;
  category: string;
  status: TicketStatus;
  slaMet: boolean;
  resolutionHours: number;
}

export interface ReportFilters {
  // Format YYYY-MM
  startDate: string;
  endDate: string;
  service: string;
  module: ReportModule;
}

export interface ReportSummary {
  total: number;
  resolved: number;
  rejected: number;

  averageResolutionHours: number;

  slaPercent: number;
  slaMet: number;
  slaLate: number;

  monthly: {
    label: string;
    count: number;
  }[];

  statuses: {
    label: TicketStatus;
    count: number;
    color: string;
  }[];

  categories: {
    group: string;
    items: {
      label: string;
      count: number;
    }[];
  }[];
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  service: string;
  module: ReportModule;

  classification: string;
  status: string;
  location: string;
}
