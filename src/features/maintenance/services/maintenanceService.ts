import { getAssetClassifications, getAssets } from "@/features/inventaris/services/inventarisApi";
import { clearAuth, getToken, getUser } from "@/features/auth-login/services/authStorage";
import type { ApiAsset } from "@/features/inventaris/types/inventaris";
import type {
  ApiMaintenanceItem,
  AssetMaintenanceOption,
  CreateMaintenanceSchedulePayload,
  HasilMaintenance,
  MaintenanceFilterState,
  MaintenanceItem,
  MaintenancePeriodOption,
  MaintenanceStatus,
  OfficerOption,
  UpdateMaintenanceSchedulePayload,
} from "../types/maintenance.types";

const STORAGE_KEY = "simple_plan_maintenance_list_v1";
const API_BASE_URL = "/api/v1";

function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export const periodOptions: MaintenancePeriodOption[] = [
  { label: "Mingguan", value: "weekly" },
  { label: "Bulanan", value: "monthly" },
  { label: "3 Bulan", value: "quarterly" },
  { label: "6 Bulan", value: "semiannually" },
  { label: "1 Tahun", value: "yearly" },
];

export function formatPeriod(raw?: string): string {
  if (!raw) return "-";
  const found = periodOptions.find((p) => p.value.toLowerCase() === raw.toLowerCase());
  if (found) return found.label;
  // Fallback if already Indonesian label
  return raw;
}

export function formatPeriodToApi(val?: string): string {
  if (!val) return "monthly";
  const found = periodOptions.find(
    (p) =>
      p.label.toLowerCase() === val.toLowerCase() || p.value.toLowerCase() === val.toLowerCase(),
  );
  return found ? found.value : val;
}

export const fallbackAssetOptions: AssetMaintenanceOption[] = [
  {
    id: 1,
    assetCodeId: 1,
    fullCode: "AST-TIK-2023-0042",
    itemName: "Server SIMRS Dell PowerEdge R740",
    roomLocation: "Ruang Konsultasi Dokter 03",
    locationDetail: "Gedung Ruangan A",
    displayLabel: "AST-TIK-2023-0042 - Server SIMRS Dell PowerEdge R740",
  },
  {
    id: 2,
    assetCodeId: 2,
    fullCode: "AST-TIK-2023-0015",
    itemName: "PC All-in-One Core i5 Poli Dalam",
    roomLocation: "Poli Dalam",
    locationDetail: "Gedung Poliklinik",
    displayLabel: "AST-TIK-2023-0015 - PC All-in-One Core i5 Poli Dalam",
  },
  {
    id: 3,
    assetCodeId: 3,
    fullCode: "AST-TIK-2023-0021",
    itemName: "Printer Thermal Kasir Farmasi 2",
    roomLocation: "Farmasi 2",
    locationDetail: "Gedung Farmasi",
    displayLabel: "AST-TIK-2023-0021 - Printer Thermal Kasir Farmasi 2",
  },
  {
    id: 4,
    assetCodeId: 4,
    fullCode: "AST-TIK-2023-0033",
    itemName: "Switch Cisco Catalyst 24 Port Lt.3",
    roomLocation: "Ruang Server Lt.3",
    locationDetail: "Gedung Utama",
    displayLabel: "AST-TIK-2023-0033 - Switch Cisco Catalyst 24 Port Lt.3",
  },
  {
    id: 5,
    assetCodeId: 5,
    fullCode: "AST-SAR-2023-0008",
    itemName: "Monitor Pasien Mindray Bed 4 UGD",
    roomLocation: "Bed 4 UGD",
    locationDetail: "Gedung UGD",
    displayLabel: "AST-SAR-2023-0008 - Monitor Pasien Mindray Bed 4 UGD",
  },
];

export const realTikOfficers: OfficerOption[] = [
  {
    id: 89,
    name: "Haris Arifin, S.Kom",
    role: "Petugas TIK",
    displayLabel: "Haris Arifin, S.Kom (IT)",
  },
  {
    id: 87,
    name: "Rani Ekasari Pratiwi, Amd.",
    role: "Petugas TIK",
    displayLabel: "Rani Ekasari Pratiwi, Amd. (IT)",
  },
  {
    id: 358,
    name: "Abdul Mufid Efendi",
    role: "Petugas TIK",
    displayLabel: "Abdul Mufid Efendi (IT)",
  },
];

export const realSarprasOfficers: OfficerOption[] = [
  { id: 72, name: "Nanang Wulid", role: "Petugas Sarpras", displayLabel: "Nanang Wulid (Umum RT)" },
  {
    id: 73,
    name: "Abdul Wahab",
    role: "Petugas Sarpras",
    displayLabel: "Abdul Wahab (Keamanan & Transportasi)",
  },
  { id: 74, name: "Afandi", role: "Petugas Sarpras", displayLabel: "Afandi (Umum RT)" },
  {
    id: 78,
    name: "Didit Purwanto",
    role: "Petugas Sarpras",
    displayLabel: "Didit Purwanto (Umum RT)",
  },
  {
    id: 79,
    name: "Ali Ridho Arifi",
    role: "Petugas Sarpras",
    displayLabel: "Ali Ridho Arifi (Umum RT-IPSRS)",
  },
  { id: 80, name: "M. Imron", role: "Petugas Sarpras", displayLabel: "M. Imron (Umum RT-IPSRS)" },
  {
    id: 81,
    name: "Angga Prahanian Syah",
    role: "Petugas Sarpras",
    displayLabel: "Angga Prahanian Syah (Umum RT-IPSRS)",
  },
  { id: 149, name: "Dimas Yanuar", role: "Petugas Sarpras", displayLabel: "Dimas Yanuar (Parkir)" },
  {
    id: 369,
    name: "Dimas Adi Firmansyah",
    role: "Petugas Sarpras",
    displayLabel: "Dimas Adi Firmansyah (Umum RT-IPSRS)",
  },
];

export const fallbackOfficerOptions: OfficerOption[] = [...realTikOfficers, ...realSarprasOfficers];

export const initialMaintenanceItems: MaintenanceItem[] = [
  {
    id: "1",
    assetCodeId: 1,
    nomorInventaris: "INV-TIK-2023",
    idBarang: "AST-TIK-2023-0042",
    namaBarang: "Server SIMRS Dell PowerEdge R740",
    klasifikasi: "Alat IT",
    lokasi: "Gedung Ruangan A",
    lokasiRuangan: "Ruang Konsultasi Dokter 03",
    jenisPemeliharaan: "Pembersihan Debu Fisik, Pengecekan Suhu & Kipas Server",
    periode: "Bulanan",
    periodeRaw: "monthly",
    tanggalJadwal: "18 Okt 2026",
    tanggalJadwalRaw: "2026-10-18",
    petugas: "Hendra Wijaya, S.Kom",
    status: "Selesai",
    isActive: true,
    hasilMaintenance: {
      uraianPekerjaan: "Pemeriksaan oli, filter, dan uji beban 30 menit",
      hasilPemeliharaan: "Genset berfungsi normal",
      kondisiPasca: "Baik",
      waktuMulai: "09 Okt 2026 08:00",
      waktuSelesai: "09 Okt 2026 09:30",
      fotoHasil: {
        namaFile: "pasca pemeliharaan.jpg",
        ukuranFile: "920 KB",
      },
    },
  },
  {
    id: "2",
    assetCodeId: 2,
    nomorInventaris: "INV-TIK-2023",
    idBarang: "AST-TIK-2023-0015",
    namaBarang: "PC All-in-One Core i5 Poli Dalam",
    klasifikasi: "Alat IT",
    lokasi: "Gedung Poliklinik",
    lokasiRuangan: "Poli Dalam",
    jenisPemeliharaan: "Pembersihan sistem dan update antivirus",
    periode: "Bulanan",
    periodeRaw: "monthly",
    tanggalJadwal: "08 Okt 2026",
    tanggalJadwalRaw: "2026-10-08",
    petugas: "Ahmad Fauzi",
    status: "Terlambat",
    isActive: true,
  },
  {
    id: "3",
    assetCodeId: 3,
    nomorInventaris: "INV-TIK-2023",
    idBarang: "AST-TIK-2023-0021",
    namaBarang: "Printer Thermal Kasir Farmasi 2",
    klasifikasi: "Alat IT",
    lokasi: "Gedung Farmasi",
    lokasiRuangan: "Farmasi 2",
    jenisPemeliharaan: "Pembersihan head printer dan kalibrasi",
    periode: "Bulanan",
    periodeRaw: "monthly",
    tanggalJadwal: "07 Okt 2026",
    tanggalJadwalRaw: "2026-10-07",
    petugas: "M. Hendra",
    status: "Terjadwal",
    isActive: true,
  },
  {
    id: "4",
    assetCodeId: 4,
    nomorInventaris: "INV-TIK-2023",
    idBarang: "AST-TIK-2023-0033",
    namaBarang: "Switch Cisco Catalyst 24 Port Lt.3",
    klasifikasi: "Alat IT",
    lokasi: "Gedung Utama",
    lokasiRuangan: "Ruang Server Lt.3",
    jenisPemeliharaan: "Pengecekan port switch dan firmware",
    periode: "3 Bulan",
    periodeRaw: "quarterly",
    tanggalJadwal: "01 Okt 2026",
    tanggalJadwalRaw: "2026-10-01",
    petugas: "Rian P.",
    status: "Terjadwal",
    isActive: true,
  },
  {
    id: "5",
    assetCodeId: 5,
    nomorInventaris: "INV-TIK-2023",
    idBarang: "AST-SAR-2023-0008",
    namaBarang: "Monitor Pasien Mindray Bed 4 UGD",
    klasifikasi: "Alat Medis",
    lokasi: "Gedung UGD",
    lokasiRuangan: "Bed 4 UGD",
    jenisPemeliharaan: "Pemeriksaan fungsi sensor dan display",
    periode: "Mingguan",
    periodeRaw: "weekly",
    tanggalJadwal: "30 Sep 2026",
    tanggalJadwalRaw: "2026-09-30",
    petugas: "Budi Santosa",
    status: "Selesai",
    isActive: true,
  },
];

function getStoredItems(): MaintenanceItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMaintenanceItems));
      return initialMaintenanceItems;
    }
    return JSON.parse(raw);
  } catch {
    return initialMaintenanceItems;
  }
}

function saveStoredItems(items: MaintenanceItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error("Gagal menyimpan items ke local storage:", err);
  }
}

function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return "-";
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Ags",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  return `${String(dateObj.getDate()).padStart(2, "0")} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
}

export function mapApiMaintenanceToItem(item: ApiMaintenanceItem): MaintenanceItem {
  const latestLog = item.logs && item.logs.length > 0 ? item.logs[0] : null;

  const rawStatus =
    typeof item.status === "object" && item.status !== null
      ? item.status.value
      : String(item.status || "terjadwal");

  let statusFormatted: MaintenanceStatus = "Terjadwal";
  if (rawStatus.toLowerCase() === "selesai") {
    statusFormatted = "Selesai";
  } else if (rawStatus.toLowerCase() === "terlambat") {
    statusFormatted = "Terlambat";
  }

  const fullCode = item.asset_code?.full_code || `AST-${item.asset_code_id}`;
  const itemName =
    item.asset_code?.asset_item?.name ||
    item.asset_code?.item?.name ||
    `Aset #${item.asset_code_id}`;

  let hasilMaintenance: HasilMaintenance | null = null;
  if (latestLog) {
    hasilMaintenance = {
      uraianPekerjaan: latestLog.work_description || "-",
      hasilPemeliharaan: latestLog.maintenance_result || "-",
      kondisiPasca: latestLog.post_maintenance_condition || "Baik",
      waktuMulai: formatDateDisplay(latestLog.started_at || undefined),
      waktuSelesai: formatDateDisplay(latestLog.completed_at || undefined),
      fotoHasil:
        latestLog.proof_photo_object_key || latestLog.photo_path
          ? {
              namaFile: latestLog.proof_photo_original_name || "foto_pemeliharaan.jpg",
              ukuranFile: "-",
              url: `/storage/${latestLog.proof_photo_object_key || latestLog.photo_path}`,
            }
          : undefined,
    };
  }

  return {
    id: String(item.id),
    assetCodeId: item.asset_code_id,
    nomorInventaris: fullCode,
    idBarang: fullCode,
    namaBarang: itemName,
    klasifikasi: item.asset_code?.classification?.name || "-",
    lokasi: item.asset_code?.location?.name || "-",
    lokasiRuangan: item.asset_code?.location?.name || "-",
    jenisPemeliharaan: item.maintenance_type,
    periode: formatPeriod(item.period),
    periodeRaw: item.period,
    tanggalJadwal: formatDateDisplay(item.next_scheduled_date),
    tanggalJadwalRaw: item.next_scheduled_date,
    petugas: item.assigned_officer?.name || "-",
    petugasId: item.assigned_officer_id,
    status: statusFormatted,
    isActive: Boolean(item.is_active),
    hasilMaintenance,
  };
}

function getStoredItemsFiltered(
  search?: string,
  filters?: Partial<MaintenanceFilterState>,
): MaintenanceItem[] {
  let items = getStoredItems();

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    items = items.filter(
      (item) =>
        item.nomorInventaris.toLowerCase().includes(q) ||
        item.namaBarang.toLowerCase().includes(q) ||
        (item.idBarang && item.idBarang.toLowerCase().includes(q)) ||
        item.petugas.toLowerCase().includes(q),
    );
  }

  if (filters) {
    if (filters.klasifikasi && filters.klasifikasi !== "Semua klasifikasi") {
      items = items.filter(
        (item) => item.klasifikasi?.toLowerCase() === filters.klasifikasi?.toLowerCase(),
      );
    }
    if (filters.lokasiRuangan && filters.lokasiRuangan !== "Semua lokasi") {
      items = items.filter(
        (item) => item.lokasiRuangan?.toLowerCase() === filters.lokasiRuangan?.toLowerCase(),
      );
    }
    if (filters.petugas && filters.petugas !== "Semua petugas") {
      items = items.filter((item) =>
        item.petugas.toLowerCase().includes(filters.petugas!.toLowerCase()),
      );
    }
    if (filters.status && filters.status !== "Semua status") {
      items = items.filter((item) => item.status.toLowerCase() === filters.status?.toLowerCase());
    }
    if (filters.rentangJadwal) {
      items = items.filter(
        (item) =>
          item.tanggalJadwalRaw === filters.rentangJadwal ||
          item.tanggalJadwal.includes(filters.rentangJadwal!),
      );
    }
  }

  return items;
}

export const maintenanceService = {
  // Ambil daftar maintenance dari API backend dengan fallback
  getMaintenances: async (
    search?: string,
    filters?: Partial<MaintenanceFilterState>,
  ): Promise<MaintenanceItem[]> => {
    try {
      const query = new URLSearchParams();

      if (search && search.trim()) {
        query.set("search", search.trim());
      }

      if (filters?.status && filters.status !== "Semua status") {
        query.set("status", filters.status.toLowerCase());
      }

      if (filters?.rentangJadwal) {
        query.set("date_from", filters.rentangJadwal);
        query.set("date_to", filters.rentangJadwal);
      }

      query.set("per_page", "100");

      const queryString = query.toString();
      const url = queryString
        ? `${API_BASE_URL}/asset-maintenances?${queryString}`
        : `${API_BASE_URL}/asset-maintenances`;

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAuth();
        }
        throw new Error(`Gagal memuat jadwal maintenance (${response.status})`);
      }

      const resJson = await response.json();
      const rawList: ApiMaintenanceItem[] = Array.isArray(resJson.data)
        ? resJson.data
        : (resJson.data?.data ?? []);

      let items = rawList.map(mapApiMaintenanceToItem);

      // Client-side filtering untuk filter yang tidak didukung langsung oleh backend query
      if (filters?.klasifikasi && filters.klasifikasi !== "Semua klasifikasi") {
        items = items.filter(
          (item) => item.klasifikasi?.toLowerCase() === filters.klasifikasi?.toLowerCase(),
        );
      }
      if (filters?.lokasiRuangan && filters.lokasiRuangan !== "Semua lokasi") {
        items = items.filter(
          (item) => item.lokasiRuangan?.toLowerCase() === filters.lokasiRuangan?.toLowerCase(),
        );
      }
      if (filters?.petugas && filters.petugas !== "Semua petugas") {
        items = items.filter((item) =>
          item.petugas.toLowerCase().includes(filters.petugas!.toLowerCase()),
        );
      }

      return items;
    } catch (err) {
      console.warn("Koneksi API maintenance gagal/offline, beralih ke cache:", err);
      return getStoredItemsFiltered(search, filters);
    }
  },

  // Ambil detail maintenance berdasarkan ID
  getMaintenanceById: async (id: string): Promise<MaintenanceItem | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/asset-maintenances/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAuth();
        }
        throw new Error(`Gagal memuat detail maintenance (${response.status})`);
      }

      const resJson = await response.json();
      const item: ApiMaintenanceItem = resJson.data ?? resJson;
      return mapApiMaintenanceToItem(item);
    } catch (err) {
      console.warn("Gagal memuat detail dari API, fallback ke cache:", err);
      const items = getStoredItems();
      return items.find((item) => String(item.id) === String(id)) || null;
    }
  },

  // Toggle status aktif/nonaktif
  toggleMaintenanceStatus: async (id: string, currentActive?: boolean): Promise<boolean> => {
    try {
      const nextActive = currentActive !== undefined ? !currentActive : false;
      const response = await fetch(`${API_BASE_URL}/asset-maintenances/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active: nextActive }),
      });

      if (!response.ok) {
        throw new Error(`Gagal mengubah status aktif (${response.status})`);
      }

      const resJson = await response.json();
      const updatedActive = resJson.data?.is_active ?? nextActive;

      // Update local storage jika ada item yang tersimpan
      const items = getStoredItems();
      const idx = items.findIndex((it) => String(it.id) === String(id));
      if (idx !== -1) {
        items[idx].isActive = updatedActive;
        saveStoredItems(items);
      }

      return Boolean(updatedActive);
    } catch (err) {
      console.warn("Gagal toggle status via API, simpan lokal:", err);
      const items = getStoredItems();
      const index = items.findIndex((item) => String(item.id) === String(id));
      if (index !== -1) {
        items[index] = {
          ...items[index],
          isActive: !items[index].isActive,
        };
        saveStoredItems(items);
        return items[index].isActive;
      }
      return true;
    }
  },

  // Ambil opsi aset dengan filter berdasarkan role (TIK: Alat IT, Sarpras: Non-TIK termasuk Alat Elektronik)
  getAssetOptions: async (
    targetDomain?: "tik" | "sarpras" | string,
  ): Promise<AssetMaintenanceOption[]> => {
    try {
      const user = getUser();
      const currentRole = (user?.role || "").toLowerCase();
      const isSarpras = targetDomain
        ? targetDomain.toLowerCase().includes("sarpras")
        : currentRole.includes("sarpras");

      const classifications = await getAssetClassifications();
      let targetClassIds: number[] = [];

      if (!isSarpras) {
        // TIK hanya mencakup klasifikasi Alat IT (kode 6)
        targetClassIds = classifications
          .filter(
            (c) =>
              c.name.toLowerCase() === "alat it" ||
              c.name.toLowerCase().includes("tik") ||
              c.code === 6,
          )
          .map((c) => c.id);
      } else {
        // Sarpras mencakup klasifikasi non-TIK (Alat Elektronik, Alat Sarpras, Alat Medis, Tanah, Bangunan, dsb)
        targetClassIds = classifications
          .filter(
            (c) =>
              c.name.toLowerCase() !== "alat it" &&
              !c.name.toLowerCase().includes("tik") &&
              c.code !== 6,
          )
          .map((c) => c.id);
      }

      // Ambil aset per klasifikasi seperti di modul Inventaris
      const fetchPromises = targetClassIds.map((classId) =>
        getAssets({ asset_classification_id: classId, per_page: 100 }),
      );

      const responses = await Promise.all(fetchPromises);
      let assetList: ApiAsset[] = [];

      for (const res of responses) {
        const raw = res as unknown as { data?: unknown };
        if (Array.isArray(res.data)) {
          assetList = assetList.concat(res.data);
        } else if (
          raw.data &&
          typeof raw.data === "object" &&
          "data" in (raw.data as Record<string, unknown>) &&
          Array.isArray((raw.data as { data: unknown }).data)
        ) {
          assetList = assetList.concat((raw.data as { data: ApiAsset[] }).data);
        }
      }

      return assetList.map((asset) => {
        const fullCode = asset.asset_code?.full_code ?? `AST-${asset.id}`;
        const itemName =
          asset.asset_code?.item?.name ||
          asset.model_specification ||
          asset.brand ||
          `Aset #${asset.id}`;
        const roomLocation = asset.asset_code?.location?.name || "-";
        const locationDetail = asset.location_detail || "-";
        const assetCodeId = asset.asset_code?.id ?? asset.id;
        const clsName = asset.asset_code?.classification?.name?.toLowerCase() || "";
        const isTik =
          clsName === "alat it" ||
          clsName.includes("tik") ||
          asset.asset_code?.classification?.code === 6;

        return {
          id: asset.id,
          assetCodeId,
          fullCode,
          itemName,
          roomLocation,
          locationDetail,
          displayLabel: `${fullCode} - ${itemName}`,
          classificationName: asset.asset_code?.classification?.name,
          isTik,
        };
      });
    } catch {
      return [];
    }
  },

  // Ambil opsi petugas dengan filter berdasarkan role domain (TIK -> petugas-tik, Sarpras -> petugas-sarpras)
  getOfficerOptions: async (
    targetDomain?: "tik" | "sarpras" | string,
  ): Promise<OfficerOption[]> => {
    const user = getUser();
    const currentRole = (user?.role || "").toLowerCase();
    let domainParam = "tik";

    if (targetDomain) {
      domainParam = targetDomain.toLowerCase().includes("sarpras") ? "sarpras" : "tik";
    } else {
      domainParam = currentRole.includes("sarpras") ? "sarpras" : "tik";
    }

    const defaultOfficers = domainParam === "sarpras" ? realSarprasOfficers : realTikOfficers;

    try {
      // Coba ambil daftar user via endpoint standar /users
      const response = await fetch(`${API_BASE_URL}/users?per_page=100`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        return defaultOfficers;
      }

      const resJson = await response.json();
      let rawUsers: Array<{
        id: number;
        name?: string;
        nama?: string;
        role?: string;
        roles?: Array<{ name: string }>;
        jabatan?: string;
        status_user?: string;
      }> = [];

      if (Array.isArray(resJson.data)) {
        rawUsers = resJson.data;
      } else if (resJson.data && Array.isArray(resJson.data.data)) {
        rawUsers = resJson.data.data;
      }

      const targetRoleKey = domainParam === "sarpras" ? "sarpras" : "tik";

      const filtered = rawUsers.filter((u) => {
        if (u.status_user && u.status_user.toLowerCase() !== "aktif") return false;
        const roleStr = (u.role || "").toLowerCase();
        const jabatanStr = (u.jabatan || "").toLowerCase();
        const rolesArr = (u.roles || []).map((r) => r.name.toLowerCase()).join(" ");
        return (
          roleStr.includes(targetRoleKey) ||
          jabatanStr.includes(targetRoleKey) ||
          rolesArr.includes(targetRoleKey)
        );
      });

      if (filtered.length > 0) {
        return filtered.map((u) => {
          const displayName = u.nama || u.name || `User #${u.id}`;
          const defaultRole = domainParam === "sarpras" ? "Petugas Sarpras" : "Petugas TIK";
          const roleLabel = u.jabatan || u.role || defaultRole;
          return {
            id: u.id,
            name: displayName,
            role: roleLabel,
            displayLabel: `${displayName} (${roleLabel})`,
          };
        });
      }

      return defaultOfficers;
    } catch (err) {
      console.warn("Gagal memuat petugas dari API, gunakan daftar petugas valid:", err);
      return defaultOfficers;
    }
  },

  // Buat jadwal baru ke API backend
  createSchedule: async (
    payload: CreateMaintenanceSchedulePayload,
    extraData?: {
      namaBarang?: string;
      lokasiRuangan?: string;
      lokasi?: string;
      fullCode?: string;
      petugasName?: string;
    },
  ): Promise<MaintenanceItem> => {
    const assetCodeId = payload.asset_code_id ?? payload.asset_id;
    const officerId = payload.assigned_officer_id ?? payload.officer_id;
    const scheduledDate = payload.next_scheduled_date ?? payload.scheduled_date ?? "";
    const apiPeriod = formatPeriodToApi(payload.period);

    const bodyPayload = {
      asset_code_id: assetCodeId,
      assigned_officer_id: officerId,
      maintenance_type: payload.maintenance_type || "Pembersihan & Pengecekan Rutin",
      period: apiPeriod,
      next_scheduled_date: scheduledDate,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/asset-maintenances`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(bodyPayload),
      });

      const resJson = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          clearAuth();
          throw new Error("Sesi login Anda telah berakhir. Silakan login kembali.");
        }
        const errorMsg =
          resJson.message ||
          (resJson.errors
            ? Object.values(resJson.errors).flat().join(", ")
            : "Gagal membuat jadwal maintenance.");
        throw new Error(errorMsg);
      }

      const createdItem: ApiMaintenanceItem = resJson.data;
      return mapApiMaintenanceToItem(createdItem);
    } catch (err) {
      if (
        err instanceof Error &&
        !err.message.includes("Failed to fetch") &&
        !err.message.includes("NetworkError")
      ) {
        throw err;
      }

      console.warn("API maintenance tidak terhubung, fallback simpan lokal:", err);
      const formattedDate = formatDateDisplay(scheduledDate);
      const newItem: MaintenanceItem = {
        id: String(Date.now()),
        assetCodeId: assetCodeId ? Number(assetCodeId) : undefined,
        nomorInventaris: extraData?.fullCode || `INV-TIK-${new Date().getFullYear()}`,
        idBarang: extraData?.fullCode || `AST-TIK-${new Date().getFullYear()}-${assetCodeId}`,
        namaBarang: extraData?.namaBarang || `Aset #${assetCodeId}`,
        klasifikasi: "Alat IT",
        lokasi: extraData?.lokasi || "Gedung Ruangan A",
        lokasiRuangan: extraData?.lokasiRuangan || "Ruangan Default",
        jenisPemeliharaan: payload.maintenance_type || "Pembersihan & Pengecekan Rutin",
        periode: formatPeriod(payload.period),
        periodeRaw: apiPeriod,
        tanggalJadwal: formattedDate,
        tanggalJadwalRaw: scheduledDate,
        petugas: extraData?.petugasName || `Petugas #${officerId}`,
        petugasId: officerId,
        status: "Terjadwal",
        isActive: true,
      };

      const existing = getStoredItems();
      saveStoredItems([newItem, ...existing]);
      return newItem;
    }
  },

  // Update jadwal yang sudah ada ke API backend
  updateSchedule: async (
    id: string,
    payload: UpdateMaintenanceSchedulePayload & {
      jenisPemeliharaan?: string;
      periode?: string;
      tanggalJadwalRaw?: string;
      petugas?: string;
    },
  ): Promise<MaintenanceItem | null> => {
    const rawPeriod = payload.period ?? payload.periode;
    const apiPeriod = rawPeriod ? formatPeriodToApi(rawPeriod) : undefined;
    const scheduledDate =
      payload.next_scheduled_date ?? payload.scheduled_date ?? payload.tanggalJadwalRaw;
    const maintenanceType = payload.maintenance_type ?? payload.jenisPemeliharaan;

    const bodyPayload: Record<string, unknown> = {};
    if (maintenanceType !== undefined) bodyPayload.maintenance_type = maintenanceType;
    if (apiPeriod !== undefined) bodyPayload.period = apiPeriod;
    if (scheduledDate !== undefined) bodyPayload.next_scheduled_date = scheduledDate;
    if (payload.assigned_officer_id !== undefined)
      bodyPayload.assigned_officer_id = payload.assigned_officer_id;
    if (payload.is_active !== undefined) bodyPayload.is_active = payload.is_active;

    try {
      const response = await fetch(`${API_BASE_URL}/asset-maintenances/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(bodyPayload),
      });

      const resJson = await response.json();

      if (!response.ok) {
        const errorMsg =
          resJson.message ||
          (resJson.errors
            ? Object.values(resJson.errors).flat().join(", ")
            : "Gagal memperbarui jadwal.");
        throw new Error(errorMsg);
      }

      const updatedItem: ApiMaintenanceItem = resJson.data;
      return mapApiMaintenanceToItem(updatedItem);
    } catch (err) {
      if (
        err instanceof Error &&
        !err.message.includes("Failed to fetch") &&
        !err.message.includes("NetworkError")
      ) {
        throw err;
      }

      console.warn("API maintenance tidak terhubung, fallback update lokal:", err);
      const items = getStoredItems();
      const index = items.findIndex((item) => String(item.id) === String(id));
      if (index !== -1) {
        let formattedDate = items[index].tanggalJadwal;
        if (scheduledDate) {
          formattedDate = formatDateDisplay(scheduledDate);
        }

        items[index] = {
          ...items[index],
          jenisPemeliharaan: maintenanceType ?? items[index].jenisPemeliharaan,
          periode: rawPeriod ? formatPeriod(rawPeriod) : items[index].periode,
          periodeRaw: apiPeriod ?? items[index].periodeRaw,
          tanggalJadwal: formattedDate,
          tanggalJadwalRaw: scheduledDate ?? items[index].tanggalJadwalRaw,
          petugas: payload.petugas ?? items[index].petugas,
          petugasId: payload.assigned_officer_id ?? items[index].petugasId,
        };
        saveStoredItems(items);
        return items[index];
      }
      return null;
    }
  },

  recordMaintenanceLog: async (
    maintenanceId: string,
    payload: {
      work_description: string;
      maintenance_result: string;
      post_maintenance_condition: "Baik" | "Rusak Ringan" | "Rusak Berat";
      started_at: string;
      completed_at: string;
      photo?: File | null;
    },
  ): Promise<MaintenanceItem | null> => {
    const token = getToken();
    const formData = new FormData();
    formData.append("work_description", payload.work_description);
    formData.append("maintenance_result", payload.maintenance_result);
    formData.append("post_maintenance_condition", payload.post_maintenance_condition);
    formData.append("started_at", payload.started_at);
    formData.append("completed_at", payload.completed_at);
    if (payload.photo) {
      formData.append("photo", payload.photo);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/asset-maintenances/${maintenanceId}/logs`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const resJson = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          clearAuth();
          throw new Error("Sesi login Anda telah berakhir. Silakan login kembali.");
        }
        const errorMsg =
          resJson.message ||
          (resJson.errors
            ? Object.values(resJson.errors).flat().join(", ")
            : "Gagal mencatat hasil maintenance.");
        throw new Error(errorMsg);
      }

      return await maintenanceService.getMaintenanceById(maintenanceId);
    } catch (err) {
      if (
        err instanceof Error &&
        !err.message.includes("Failed to fetch") &&
        !err.message.includes("NetworkError") &&
        !err.message.includes("403")
      ) {
        throw err;
      }

      console.warn("API record log fallback lokal:", err);
      const items = getStoredItems();
      const index = items.findIndex((item) => String(item.id) === String(maintenanceId));
      if (index !== -1) {
        items[index] = {
          ...items[index],
          status: "Selesai",
          hasilMaintenance: {
            uraianPekerjaan: payload.work_description,
            hasilPemeliharaan: payload.maintenance_result,
            kondisiPasca: payload.post_maintenance_condition,
            waktuMulai: formatDateDisplay(payload.started_at),
            waktuSelesai: formatDateDisplay(payload.completed_at),
            fotoHasil: payload.photo
              ? {
                  namaFile: payload.photo.name,
                  ukuranFile: `${(payload.photo.size / 1024).toFixed(0)} KB`,
                  url: URL.createObjectURL(payload.photo),
                }
              : undefined,
          },
        };
        saveStoredItems(items);
        return items[index];
      }
      return null;
    }
  },
};
