import type {
  CreateDesignRequestPayload,
  DesignRequestItem,
  DesignRequestStatus,
} from "../types/designGraphic.types";

const STORAGE_KEY = "simple_plan_design_graphic_requests_v1";

const BULAN_PENDEK = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export function formatTanggalIndoPendek(isoDate: string): string {
  if (!isoDate) return "-";
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  const day = parsed.getDate();
  const month = BULAN_PENDEK[parsed.getMonth()] ?? "";
  const year = parsed.getFullYear();
  return `${day} ${month} ${year}`;
}

const INITIAL_REQUESTS: DesignRequestItem[] = [
  {
    id: "req-1",
    nomorRequest: "#REQ-DG2023018",
    judulRequest: "Banner Edukasi Cuci Tangan 6 Langkah",
    jenisDesain: "Banner",
    deskripsiKebutuhan: "Banner edukasi cuci tangan ukuran 60x160 cm untuk area IGD",
    unit: "IGD",
    namaPemohon: "Agung Sunaryo S.Kom",
    tanggalDibutuhkan: "14 Okt 2026",
    tanggalDibutuhkanRaw: "2026-10-14",
    status: "Baru",
  },
  {
    id: "req-2",
    nomorRequest: "#REQ-DG2023018",
    judulRequest: "Brosur Layanan Rawat Inap VIP",
    jenisDesain: "Brosur",
    deskripsiKebutuhan: "Brosur lipat 3 ukuran A4 mengenai fasilitas Rawat Inap VIP",
    unit: "Radiologi",
    namaPemohon: "Agung Sunaryo S.Kom",
    tanggalDibutuhkan: "12 Okt 2026",
    tanggalDibutuhkanRaw: "2026-10-12",
    status: "Ditugaskan",
  },
  {
    id: "req-3",
    nomorRequest: "#REQ-DG2023018",
    judulRequest: "X Banner Peringatan Hari Kesehatan",
    jenisDesain: "X Banner",
    deskripsiKebutuhan: "X Banner ukuran 60x160 cm tema Hari Kesehatan Nasional",
    unit: "Radiologi",
    namaPemohon: "Agung Sunaryo S.Kom",
    tanggalDibutuhkan: "11 Okt 2026",
    tanggalDibutuhkanRaw: "2026-10-11",
    status: "Menunggu Persetujuan",
  },
  {
    id: "req-4",
    nomorRequest: "#REQ-DG2023018",
    judulRequest: "Poster Alur Pendaftaran BPJS",
    jenisDesain: "Poster",
    deskripsiKebutuhan: "Poster ukuran A3 mengenai alur pendaftaran pasien BPJS",
    unit: "Tulip 8",
    namaPemohon: "Agung Sunaryo S.Kom",
    tanggalDibutuhkan: "9 Okt 2026",
    tanggalDibutuhkanRaw: "2026-10-09",
    status: "Baru",
  },
  {
    id: "req-5",
    nomorRequest: "#REQ-DG2023018",
    judulRequest: "Poster Sosialiasasi Vaksinasi Booster",
    jenisDesain: "Poster",
    deskripsiKebutuhan: "Poster sosialisasi jadwal vaksinasi booster ukuran A3",
    unit: "IGD",
    namaPemohon: "Agung Sunaryo S.Kom",
    tanggalDibutuhkan: "7 Okt 2026",
    tanggalDibutuhkanRaw: "2026-10-07",
    status: "Ditugaskan",
  },
  {
    id: "req-6",
    nomorRequest: "#REQ-DG2023018",
    judulRequest: "Twibbon Akreditasi Rumah Sakit",
    jenisDesain: "Twibbon",
    deskripsiKebutuhan: "Desain frame twibbon persegi 1080x1080 px untuk sukseskan akreditasi",
    unit: "Tulip 9",
    namaPemohon: "Agung Sunaryo S.Kom",
    tanggalDibutuhkan: "7 Okt 2026",
    tanggalDibutuhkanRaw: "2026-10-07",
    status: "Perlu Revisi",
  },
  {
    id: "req-7",
    nomorRequest: "#REQ-DG2023018",
    judulRequest: "Poster Wajib Menggunakan Masker",
    jenisDesain: "Poster",
    deskripsiKebutuhan: "Poster himbauan wajib memakai masker di lingkungan RS",
    unit: "Mawar",
    namaPemohon: "Agung Sunaryo S.Kom",
    tanggalDibutuhkan: "7 Okt 2026",
    tanggalDibutuhkanRaw: "2026-10-07",
    status: "Selesai",
  },
  {
    id: "req-8",
    nomorRequest: "#REQ-DG2023018",
    judulRequest: "Infografis Sayangi Bumi",
    jenisDesain: "Infografis",
    deskripsiKebutuhan: "Infografis hemat energi dan air di lingkungan rumah sakit",
    unit: "IGD",
    namaPemohon: "Agung Sunaryo S.Kom",
    tanggalDibutuhkan: "6 Okt 2026",
    tanggalDibutuhkanRaw: "2026-10-06",
    status: "Selesai",
  },
  {
    id: "req-9",
    nomorRequest: "#REQ-DG2023018",
    judulRequest: "Poster Hari Anak Nasional",
    jenisDesain: "Poster",
    deskripsiKebutuhan: "Poster ucapan selamat Hari Anak Nasional",
    unit: "Radiologi",
    namaPemohon: "Agung Sunaryo S.Kom",
    tanggalDibutuhkan: "6 Okt 2026",
    tanggalDibutuhkanRaw: "2026-10-06",
    status: "Ditolak",
  },
  {
    id: "req-10",
    nomorRequest: "#REQ-DG2023018",
    judulRequest: "Poster K3",
    jenisDesain: "Poster",
    deskripsiKebutuhan: "Poster keselamatan dan kesehatan kerja rumah sakit",
    unit: "IGD",
    namaPemohon: "Agung Sunaryo S.Kom",
    tanggalDibutuhkan: "5 Okt 2026",
    tanggalDibutuhkanRaw: "2026-10-05",
    status: "Selesai",
  },
];

function readStoredRequests(): DesignRequestItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
      return [...INITIAL_REQUESTS];
    }
    const parsed = JSON.parse(raw) as DesignRequestItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
      return [...INITIAL_REQUESTS];
    }
    return parsed;
  } catch {
    return [...INITIAL_REQUESTS];
  }
}

function writeStoredRequests(items: DesignRequestItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error("Gagal menyimpan data request desain ke localStorage:", err);
  }
}

export const DESIGN_STATUS_LIST: DesignRequestStatus[] = [
  "Baru",
  "Ditugaskan",
  "Menunggu Persetujuan",
  "Perlu Revisi",
  "Selesai",
  "Ditolak",
];

export const designGraphicService = {
  async getRequests(search = "", statusFilter = "Semua status"): Promise<DesignRequestItem[]> {
    const all = readStoredRequests();
    const query = search.trim().toLowerCase();

    return all.filter((item) => {
      const matchesSearch =
        !query ||
        item.nomorRequest.toLowerCase().includes(query) ||
        item.judulRequest.toLowerCase().includes(query) ||
        item.unit.toLowerCase().includes(query);

      const matchesStatus =
        !statusFilter || statusFilter === "Semua status" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  },

  async createRequest(payload: CreateDesignRequestPayload): Promise<DesignRequestItem> {
    const current = readStoredRequests();
    const nextNumber = 18 + current.length + 1;
    const newItem: DesignRequestItem = {
      id: `req-${Date.now()}`,
      nomorRequest: `#REQ-DG20230${nextNumber}`,
      judulRequest: payload.judulRequest.trim(),
      jenisDesain: payload.jenisDesain.trim(),
      deskripsiKebutuhan: payload.deskripsiKebutuhan.trim(),
      unit: payload.unit || "IT",
      namaPemohon: payload.namaPemohon || "Agung Sunaryo S.Kom",
      tanggalDibutuhkan: formatTanggalIndoPendek(payload.tanggalDibutuhkan),
      tanggalDibutuhkanRaw: payload.tanggalDibutuhkan,
      status: "Baru",
      fileReferensiName: payload.fileReferensi?.name,
      createdAt: new Date().toISOString(),
    };

    const updated = [newItem, ...current];
    writeStoredRequests(updated);
    return newItem;
  },
};
