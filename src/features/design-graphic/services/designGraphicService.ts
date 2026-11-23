import type {
  CreateDesignRequestPayload,
  DesignRequestItem,
  DesignRequestStatus,
} from "../types/designGraphic.types";
import { apiFetch } from "@/lib/apiFetch";
import { getToken } from "@/features/auth-login/services/authStorage";
import type { ApiMeta } from "@/types/api";

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

  const cleanDateStr = isoDate.includes("T") ? isoDate.split("T")[0] : isoDate.trim();
  const parts = cleanDateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(monthIdx) && !isNaN(day) && BULAN_PENDEK[monthIdx]) {
      return `${day} ${BULAN_PENDEK[monthIdx]} ${year}`;
    }
  }

  const parsed = new Date(isoDate);
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

const STATUS_MAP_FROM_API: Record<string, DesignRequestStatus> = {
  baru: "Baru",
  ditugaskan: "Ditugaskan",
  menunggu_persetujuan: "Menunggu Persetujuan",
  perlu_revisi: "Perlu Revisi",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

const STATUS_MAP_TO_API: Record<string, string> = {
  Baru: "baru",
  Ditugaskan: "ditugaskan",
  "Menunggu Persetujuan": "menunggu_persetujuan",
  "Perlu Revisi": "perlu_revisi",
  Selesai: "selesai",
  Ditolak: "ditolak",
};

interface ApiDesignRequest {
  id: number;
  request_number: string;
  title: string;
  design_type: string;
  description: string;
  needed_at: string;
  status: string;
  requester?: {
    id: number;
    name: string;
  };
  unit?: {
    id: number;
    name: string;
  };
  reference_file?: {
    original_name: string;
    mime_type: string;
    size: number;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface GetDesignRequestsParams {
  scope?: "mine" | "all" | "assigned";
  search?: string;
  statusFilter?: string;
  page?: number;
  per_page?: number;
}

export interface DesignRequestCollectionResponse {
  data: DesignRequestItem[];
  meta: ApiMeta;
}

export const designGraphicService = {
  async getRequests(
    paramsOrSearch: GetDesignRequestsParams | string = {},
    maybeStatusFilter = "Semua status",
  ): Promise<DesignRequestCollectionResponse> {
    let params: GetDesignRequestsParams;
    if (typeof paramsOrSearch === "string") {
      params = {
        search: paramsOrSearch,
        statusFilter: maybeStatusFilter,
      };
    } else {
      params = paramsOrSearch;
    }

    const {
      scope = "mine",
      search = "",
      statusFilter = "Semua status",
      page = 1,
      per_page = 15,
    } = params;

    const query = new URLSearchParams();
    query.set("scope", scope);
    query.set("page", String(page));
    query.set("per_page", String(per_page));

    if (search.trim()) {
      query.set("search", search.trim());
    }

    if (statusFilter && statusFilter !== "Semua status") {
      const apiStatus = STATUS_MAP_TO_API[statusFilter] || statusFilter.toLowerCase();
      query.set("status", apiStatus);
    }

    try {
      const token = getToken();
      const headers: HeadersInit = {
        Accept: "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiFetch(`/api/v1/design-requests?${query.toString()}`, {
        headers,
      });

      if (response.ok) {
        const body = (await response.json()) as {
          data: ApiDesignRequest[];
          meta?: ApiMeta;
        };

        const mappedData: DesignRequestItem[] = (body.data || []).map((raw) => ({
          id: String(raw.id),
          nomorRequest: raw.request_number,
          judulRequest: raw.title,
          jenisDesain: raw.design_type,
          deskripsiKebutuhan: raw.description,
          unit: raw.unit?.name ?? "-",
          namaPemohon: raw.requester?.name ?? "-",
          tanggalDibutuhkan: formatTanggalIndoPendek(raw.needed_at),
          tanggalDibutuhkanRaw: raw.needed_at,
          status: STATUS_MAP_FROM_API[raw.status] ?? "Baru",
          fileReferensiName: raw.reference_file?.original_name,
          createdAt: raw.created_at,
        }));

        const meta = body.meta || {
          current_page: page,
          from: mappedData.length > 0 ? (page - 1) * per_page + 1 : 0,
          last_page: Math.max(1, Math.ceil(mappedData.length / per_page)),
          per_page,
          to: (page - 1) * per_page + mappedData.length,
          total: mappedData.length,
        };

        return {
          data: mappedData,
          meta,
        };
      }
    } catch (err) {
      console.warn("Gagal memanggil API /api/v1/design-requests, fallback ke data lokal:", err);
    }

    // Fallback jika API gagal atau offline
    const all = readStoredRequests();
    const q = search.trim().toLowerCase();

    const filtered = all.filter((item) => {
      const matchesSearch =
        !q ||
        item.nomorRequest.toLowerCase().includes(q) ||
        item.judulRequest.toLowerCase().includes(q) ||
        item.unit.toLowerCase().includes(q);

      const matchesStatus =
        !statusFilter || statusFilter === "Semua status" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    const total = filtered.length;
    const lastPage = Math.max(1, Math.ceil(total / per_page));
    const safePage = Math.min(Math.max(1, page), lastPage);
    const paginated = filtered.slice((safePage - 1) * per_page, safePage * per_page);

    return {
      data: paginated,
      meta: {
        current_page: safePage,
        from: total > 0 ? (safePage - 1) * per_page + 1 : 0,
        last_page: lastPage,
        per_page,
        to: Math.min(safePage * per_page, total),
        total,
      },
    };
  },

  async createRequest(payload: CreateDesignRequestPayload): Promise<DesignRequestItem> {
    const token = getToken();
    const formData = new FormData();
    formData.append("title", payload.judulRequest.trim());
    formData.append("design_type", payload.jenisDesain.trim());
    formData.append("description", payload.deskripsiKebutuhan.trim());
    formData.append("needed_at", payload.tanggalDibutuhkan);
    if (payload.fileReferensi) {
      formData.append("reference_file", payload.fileReferensi);
    }

    try {
      const headers: HeadersInit = {
        Accept: "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiFetch("/api/v1/design-requests", {
        method: "POST",
        headers,
        body: formData,
      });

      if (response.ok) {
        const body = (await response.json()) as { data: ApiDesignRequest };
        const raw = body.data;
        const createdItem: DesignRequestItem = {
          id: String(raw.id),
          nomorRequest: raw.request_number,
          judulRequest: raw.title,
          jenisDesain: raw.design_type,
          deskripsiKebutuhan: raw.description,
          unit: raw.unit?.name ?? "-",
          namaPemohon: raw.requester?.name ?? "-",
          tanggalDibutuhkan: formatTanggalIndoPendek(raw.needed_at),
          tanggalDibutuhkanRaw: raw.needed_at,
          status: STATUS_MAP_FROM_API[raw.status] ?? "Baru",
          fileReferensiName: raw.reference_file?.original_name,
          createdAt: raw.created_at,
        };

        // Simpan juga ke stored requests lokal
        const current = readStoredRequests();
        writeStoredRequests([createdItem, ...current]);
        return createdItem;
      } else {
        const errorBody = (await response.json().catch(() => null)) as {
          message?: string;
          errors?: Record<string, string[]>;
        } | null;

        console.error("Gagal membuat request via API:", response.status, errorBody);
        const errorMsg =
          errorBody?.message ||
          (errorBody?.errors
            ? Object.values(errorBody.errors).flat().join(", ")
            : `Gagal membuat request desain (${response.status})`);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error("Error createRequest:", err);
      throw err;
    }
  },
};
