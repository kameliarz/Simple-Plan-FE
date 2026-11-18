import type { ReportTicket, TicketStatus } from "../types/report.types";

const monthlyCounts = [14, 16, 18, 16, 20, 25, 21, 42, 39, 45, 20, 22];

// Jumlah status harus mengikuti data dummy
const statusCounts: {
  status: TicketStatus;
  count: number;
}[] = [
  { status: "Baru", count: 12 },
  { status: "Diklasisfikasikan", count: 4 },
  { status: "Diproses", count: 8 },
  { status: "Eskalasi", count: 3 },
  { status: "Terselesaikan", count: 21 },
  { status: "Selesai", count: 164 },
  { status: "Ditolak", count: 8 },
];

const categoryGroups = [
  {
    category: "Kategori Sarpras / Sarpras",
    service: "Sarpras",
    count: 40,
  },
  {
    category: "Kategori Sarpras / Elektronik",
    service: "Elektronik",
    count: 27,
  },
  {
    category: "Kategori Sarpras / Alkes",
    service: "Alkes",
    count: 19,
  },
  {
    category: "Kategori TIK / Manajemen tiket kunjungan pasien",
    service: "TIK",
    count: 40,
  },
  {
    category: "Kategori TIK / Edit Asesmen Medis Dokter",
    service: "TIK",
    count: 27,
  },
  {
    category: "Kategori TIK / Edit Asesmen Keperawatan",
    service: "TIK",
    count: 22,
  },
  {
    category: "Kategori TIK / Support Aplikasi Operasional",
    service: "TIK",
    count: 25,
  },
  {
    category: "Kategori TIK / Edit data operasional",
    service: "TIK",
    count: 20,
  },
];

function expandCounts<T>(values: { value: T; count: number }[]): T[] {
  return values.flatMap(({ value, count }) => Array.from({ length: count }, () => value));
}

const statuses = expandCounts(
  statusCounts.map(({ status, count }) => ({
    value: status,
    count,
  })),
);

const categories = expandCounts(
  categoryGroups.map((item) => ({
    value: item,
    count: item.count,
  })),
);

export const mockReportTickets: ReportTicket[] = monthlyCounts.flatMap((count, monthIndex) =>
  Array.from({ length: count }, (_, ticketIndex) => {
    const index = monthlyCounts.slice(0, monthIndex).reduce((sum, n) => sum + n, 0) + ticketIndex;

    const category = categories[(index * 37) % categories.length];

    return {
      id: `HD-${String(index + 1).padStart(4, "0")}`,

      createdAt:
        `2025-${String(monthIndex + 1).padStart(2, "0")}` +
        `-${String((ticketIndex % 28) + 1).padStart(2, "0")}`,

      module: "helpdesk",

      service: category.service,
      category: category.category,

      status: statuses[(index * 37) % statuses.length],

      slaMet: index < 192,

      resolutionHours: index % 2 === 0 ? 4.8 : 5.6,
    };
  }),
);
