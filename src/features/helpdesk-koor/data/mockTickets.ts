import type { TicketItem } from "../types/helpdesk";

export const MOCK_TICKETS: TicketItem[] = [
  {
    id: "1",
    code: "TIK-2023-045",
    title: "Jaringan Wi-Fi Lantai 3 Mati Total",
    description:
      "Jaringan Wi-Fi Lantai 3 Mati Total. Koneksi internet di seluruh area lantai 3 terputus sejak pagi ini. Sudah coba restart router tapi tetap tidak bisa.",
    category: "Ketidakstabilan System",
    status: "Baru",
    priority: "Medium",
    reporter: {
      name: "Ahmad Subagyo",
      unit: "Poli Umum",
      avatarInitials: "AS",
    },
    createdAt: "10 Okt 2023, 08:30",
    attachments: [
      {
        id: "att-1",
        name: "sebelum_perbaikan.jpg",
        size: "920 KB",
        url: "#",
      },
    ],
    history: [
      {
        id: "log-1",
        action: "Menunggu Verifikasi",
        timestamp: "10 Okt 08:45",
        isCompleted: true,
      },
      {
        id: "log-2",
        action: "Tiket dibuat.",
        timestamp: "10 Okt 08:30",
        isCompleted: false,
      },
    ],
  },
  {
    id: "2",
    code: "SRP-2023-089",
    title: "Kerusakan Lampu Operasi Bedah 2",
    description: "Lampu utama kamar operasi berkedip saat tindakan berlangsung.",
    category: "Sarpras",
    status: "Diproses",
    priority: "Medium",
    reporter: {
      name: "Dr. Wahyudi",
      unit: "IGD",
      avatarInitials: "DW",
    },
    createdAt: "09 Okt 2023, 14:30",
  },
  {
    id: "3",
    code: "SRP-2023-089",
    title: "Permintaan Penggantian Tabung Oksigen",
    description: "Tabung oksigen cadangan di poli anak menipis.",
    category: "Sarpras",
    status: "Terselesaikan",
    priority: "Medium",
    reporter: {
      name: "Siti Rahma",
      unit: "Farmasi",
      avatarInitials: "SR",
    },
    createdAt: "08 Okt 2023, 11:30",
  },
  {
    id: "4",
    code: "SRP-2023-089",
    title: "Update Master Obat Sistem E-Prescription",
    description: "Penambahan katalog obat baru pada modul apotek.",
    category: "TIK",
    status: "Diklasifikasi",
    priority: "Medium",
    reporter: {
      name: "Citra Dwi",
      unit: "Farmasi",
      avatarInitials: "CD",
    },
    createdAt: "06 Okt 2023, 10.00",
  },
  {
    id: "5",
    code: "SRP-2023-089",
    title: "Penambahan Titik Akses Baru Gedung B",
    description: "Permintaan instalasi access point baru untuk ruang tunggu rawat jalan.",
    category: "TIK",
    status: "Ditolak",
    priority: "Medium",
    reporter: {
      name: "Naura Indra",
      unit: "IGD",
      avatarInitials: "NR",
    },
    createdAt: "06 Okt 2023, 10.00",
  },
];
