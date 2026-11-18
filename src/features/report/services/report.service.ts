import { mockReportTickets } from "./report.mock";

import type {
  ReportFilters,
  ReportSummary,
  ReportTicket,
  TicketStatus,
} from "../types/report.types";

export const reportTabs = [
  { label: "Helpdesk", value: "helpdesk" },
  { label: "Inventaris", value: "inventaris" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Desain Grafis", value: "desain-grafis" },
] as const;

export const serviceOptions = [
  { label: "Semua", value: "all" },
  { label: "Sarpras", value: "Sarpras" },
  { label: "Elektronik", value: "Elektronik" },
  { label: "Alkes", value: "Alkes" },
  { label: "TIK", value: "TIK" },
];

const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const statusColors: Record<TicketStatus, string> = {
  Baru: "#D0D1D3",
  Diklasisfikasikan: "#F59E0B",
  Diproses: "#0D47A1",
  Eskalasi: "#C2410C",
  Terselesaikan: "#10B981",
  Selesai: "#747782",
  Ditolak: "#DC2626",
};

const statusOrder = Object.keys(statusColors) as TicketStatus[];

// =====================================
// FILTER DATA BERDASARKAN BULAN TAHUN
// =====================================

export function filterReportTickets(
  tickets: ReportTicket[],
  filters: ReportFilters,
): ReportTicket[] {
  return tickets.filter((ticket) => {
    if (ticket.module !== filters.module) {
      return false;
    }

    // Format YYYY-MM
    const ticketMonth = ticket.createdAt.slice(0, 7);

    // Bulan awal ikut dihitung
    if (filters.startDate && ticketMonth < filters.startDate) {
      return false;
    }

    // Bulan akhir ikut dihitung
    if (filters.endDate && ticketMonth > filters.endDate) {
      return false;
    }

    if (filters.service !== "all" && ticket.service !== filters.service) {
      return false;
    }

    return true;
  });
}

// =====================================
// BUILD SUMMARY
// =====================================

export function buildReportSummary(tickets: ReportTicket[], filters: ReportFilters): ReportSummary {
  const total = tickets.length;

  const resolved = tickets.filter(
    (ticket) => ticket.status === "Selesai" || ticket.status === "Terselesaikan",
  ).length;

  const rejected = tickets.filter((ticket) => ticket.status === "Ditolak").length;

  const slaMet = tickets.filter((ticket) => ticket.slaMet).length;

  const monthly = months.map((label, month) => {
    const count = tickets.filter((ticket) => {
      const ticketYear = ticket.createdAt.slice(0, 4);
      const ticketMonth = Number(ticket.createdAt.slice(5, 7));

      // Untuk filter multi-tahun,
      // hitung bulan pada seluruh tahun terpilih.
      // Label chart tetap Jan-Des.
      const matchesMonth = ticketMonth === month + 1;

      const matchesYear = !filters.startDate && !filters.endDate ? true : Boolean(ticketYear);

      return matchesMonth && matchesYear;
    }).length;

    return {
      label,
      count,
    };
  });

  const statuses = statusOrder.map((label) => ({
    label,
    count: tickets.filter((ticket) => ticket.status === label).length,
    color: statusColors[label],
  }));

  const groups = ["Kategori Sarpras", "Kategori TIK"];

  const categories = groups.map((group) => {
    const labels = [
      ...new Set(
        tickets
          .filter((ticket) => ticket.category.startsWith(`${group} / `))
          .map((ticket) => ticket.category),
      ),
    ];

    return {
      group,
      items: labels
        .map((category) => ({
          label: category.split(" / ").slice(1).join(" / "),

          count: tickets.filter((ticket) => ticket.category === category).length,
        }))
        .sort((a, b) => b.count - a.count),
    };
  });

  const averageResolutionHours = total
    ? tickets.reduce((sum, ticket) => sum + ticket.resolutionHours, 0) / total
    : 0;

  return {
    total,
    resolved,
    rejected,

    averageResolutionHours,

    slaPercent: total ? (slaMet / total) * 100 : 0,

    slaMet,
    slaLate: total - slaMet,

    monthly,
    statuses,
    categories,
  };
}

// =====================================
// GET REPORT
// =====================================

export function getReport(filters: ReportFilters) {
  const tickets = filterReportTickets(mockReportTickets, filters);

  return {
    tickets,
    summary: buildReportSummary(tickets, filters),
  };
}

// =====================================
// DOWNLOAD CSV
// =====================================

function csvCell(value: string | number) {
  const safeValue = String(value);

  // Mencegah formula dieksekusi di aplikasi spreadsheet.
  const escapedValue = /^[=+\-@\t\r]/.test(safeValue) ? `'${safeValue}` : safeValue;

  return `"${escapedValue.replace(/"/g, '""')}"`;
}

export function downloadReportCsv(tickets: ReportTicket[], filename = "laporan-report.csv") {
  const columns = [
    "ID",
    "Tanggal",
    "Modul",
    "Jenis Layanan",
    "Kategori",
    "Status",
    "SLA",
    "Waktu Penyelesaian (jam)",
  ];

  const rows = tickets.map((ticket) => [
    ticket.id,
    ticket.createdAt,
    ticket.module,
    ticket.service,
    ticket.category,
    ticket.status,
    ticket.slaMet ? "Tercapai" : "Terlambat",
    ticket.resolutionHours,
  ]);

  const csv = "\uFEFF" + [columns, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
