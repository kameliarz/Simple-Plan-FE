import { getAssets } from "@/features/inventaris/services/inventarisApi";
import { getUsers } from "@/features/master-data/users/services/userApi";
import type {
  AssetMaintenanceOption,
  CreateMaintenanceSchedulePayload,
  MaintenanceFilterState,
  MaintenanceItem,
  MaintenancePeriodOption,
  OfficerOption,
} from "../types/maintenance.types";

const STORAGE_KEY = "simple_plan_maintenance_list_v1";

export const periodOptions: MaintenancePeriodOption[] = [
  { label: "Mingguan", value: "Mingguan" },
  { label: "Bulanan", value: "Bulanan" },
  { label: "3 Bulan", value: "3 Bulan" },
  { label: "6 Bulan", value: "6 Bulan" },
  { label: "1 Tahun", value: "1 Tahun" },
  { label: "Insidental", value: "Insidental" },
];

export const fallbackAssetOptions: AssetMaintenanceOption[] = [
  {
    id: 1,
    fullCode: "AST-TIK-2023-0042",
    itemName: "Server SIMRS Dell PowerEdge R740",
    roomLocation: "Ruang Konsultasi Dokter 03",
    locationDetail: "Gedung Ruangan A",
    displayLabel: "AST-TIK-2023-0042 - Server SIMRS Dell PowerEdge R740",
  },
  {
    id: 2,
    fullCode: "AST-TIK-2023-0015",
    itemName: "PC All-in-One Core i5 Poli Dalam",
    roomLocation: "Poli Dalam",
    locationDetail: "Gedung Poliklinik",
    displayLabel: "AST-TIK-2023-0015 - PC All-in-One Core i5 Poli Dalam",
  },
  {
    id: 3,
    fullCode: "AST-TIK-2023-0021",
    itemName: "Printer Thermal Kasir Farmasi 2",
    roomLocation: "Farmasi 2",
    locationDetail: "Gedung Farmasi",
    displayLabel: "AST-TIK-2023-0021 - Printer Thermal Kasir Farmasi 2",
  },
  {
    id: 4,
    fullCode: "AST-TIK-2023-0033",
    itemName: "Switch Cisco Catalyst 24 Port Lt.3",
    roomLocation: "Ruang Server Lt.3",
    locationDetail: "Gedung Utama",
    displayLabel: "AST-TIK-2023-0033 - Switch Cisco Catalyst 24 Port Lt.3",
  },
  {
    id: 5,
    fullCode: "AST-SAR-2023-0008",
    itemName: "Monitor Pasien Mindray Bed 4 UGD",
    roomLocation: "Bed 4 UGD",
    locationDetail: "Gedung UGD",
    displayLabel: "AST-SAR-2023-0008 - Monitor Pasien Mindray Bed 4 UGD",
  },
];

export const fallbackOfficerOptions: OfficerOption[] = [
  {
    id: 1,
    name: "Ahmad Fauzi",
    role: "Petugas TIK",
    displayLabel: "Ahmad Fauzi (Petugas TIK)",
  },
  {
    id: 2,
    name: "M. Hendra",
    role: "Petugas TIK",
    displayLabel: "M. Hendra (Petugas TIK)",
  },
  {
    id: 3,
    name: "Rian P.",
    role: "Petugas TIK",
    displayLabel: "Rian P. (Petugas TIK)",
  },
  {
    id: 4,
    name: "Budi Santosa",
    role: "Petugas Sarpras",
    displayLabel: "Budi Santosa (Petugas Sarpras)",
  },
  {
    id: 5,
    name: "Hendra Wijaya, S.Kom",
    role: "Koordinator Sarpras",
    displayLabel: "Hendra Wijaya, S.Kom (Koordinator Sarpras)",
  },
];

export const initialMaintenanceItems: MaintenanceItem[] = [
  {
    id: "1",
    nomorInventaris: "INV-TIK-2023",
    idBarang: "AST-TIK-2023-0042",
    namaBarang: "Server SIMRS Dell PowerEdge R740",
    klasifikasi: "Alat IT",
    lokasi: "Gedung Ruangan A",
    lokasiRuangan: "Ruang Konsultasi Dokter 03",
    jenisPemeliharaan: "Pembersihan Debu Fisik, Pengecekan Suhu & Kipas Server",
    periode: "Bulanan",
    tanggalJadwal: "18 Oktober 2026 09:20",
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
    nomorInventaris: "INV-TIK-2023",
    idBarang: "AST-TIK-2023-0015",
    namaBarang: "PC All-in-One Core i5 Poli Dalam",
    klasifikasi: "Alat IT",
    lokasi: "Gedung Poliklinik",
    lokasiRuangan: "Poli Dalam",
    jenisPemeliharaan: "Pembersihan sistem dan update antivirus",
    periode: "Bulanan",
    tanggalJadwal: "08 Okt 2026",
    tanggalJadwalRaw: "2026-10-08",
    petugas: "Ahmad Fauzi",
    status: "Terlambat",
    isActive: true,
  },
  {
    id: "3",
    nomorInventaris: "INV-TIK-2023",
    idBarang: "AST-TIK-2023-0021",
    namaBarang: "Printer Thermal Kasir Farmasi 2",
    klasifikasi: "Alat IT",
    lokasi: "Gedung Farmasi",
    lokasiRuangan: "Farmasi 2",
    jenisPemeliharaan: "Pembersihan head printer dan kalibrasi",
    periode: "Bulanan",
    tanggalJadwal: "07 Okt 2026",
    tanggalJadwalRaw: "2026-10-07",
    petugas: "M. Hendra",
    status: "Terjadwal",
    isActive: true,
  },
  {
    id: "4",
    nomorInventaris: "INV-TIK-2023",
    idBarang: "AST-TIK-2023-0033",
    namaBarang: "Switch Cisco Catalyst 24 Port Lt.3",
    klasifikasi: "Alat IT",
    lokasi: "Gedung Utama",
    lokasiRuangan: "Ruang Server Lt.3",
    jenisPemeliharaan: "Pengecekan port switch dan firmware",
    periode: "3 Bulan",
    tanggalJadwal: "01 Okt 2026",
    tanggalJadwalRaw: "2026-10-01",
    petugas: "Rian P.",
    status: "Terjadwal",
    isActive: true,
  },
  {
    id: "5",
    nomorInventaris: "INV-TIK-2023",
    idBarang: "AST-SAR-2023-0008",
    namaBarang: "Monitor Pasien Mindray Bed 4 UGD",
    klasifikasi: "Alat Medis",
    lokasi: "Gedung UGD",
    lokasiRuangan: "Bed 4 UGD",
    jenisPemeliharaan: "Pemeriksaan fungsi sensor dan display",
    periode: "Mingguan",
    tanggalJadwal: "30 Sep 2026",
    tanggalJadwalRaw: "2026-09-30",
    petugas: "Budi Santosa",
    status: "Selesai",
    isActive: true,
  },
  {
    id: "6",
    nomorInventaris: "INV-TIK-2023",
    idBarang: "AST-SAR-2023-0009",
    namaBarang: "Monitor Pasien Mindray Bed 4 UGD",
    klasifikasi: "Alat Medis",
    lokasi: "Gedung UGD",
    lokasiRuangan: "Bed 4 UGD",
    jenisPemeliharaan: "Pemeriksaan fungsi sensor dan display",
    periode: "Mingguan",
    tanggalJadwal: "30 Sep 2026",
    tanggalJadwalRaw: "2026-09-30",
    petugas: "Budi Santosa",
    status: "Selesai",
    isActive: true,
  },
  {
    id: "7",
    nomorInventaris: "INV-TIK-2023",
    idBarang: "AST-SAR-2023-0010",
    namaBarang: "Monitor Pasien Mindray Bed 4 UGD",
    klasifikasi: "Alat Medis",
    lokasi: "Gedung UGD",
    lokasiRuangan: "Bed 4 UGD",
    jenisPemeliharaan: "Pemeriksaan fungsi sensor dan display",
    periode: "Mingguan",
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

// Helper untuk promise timeout agar tidak pernah hang
function withTimeout<T>(promise: Promise<T>, ms = 1500, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export const maintenanceService = {
  // Ambil daftar maintenance dengan pencarian & filter - INSTAN TANPA HANG
  getMaintenances: async (
    search?: string,
    filters?: Partial<MaintenanceFilterState>,
  ): Promise<MaintenanceItem[]> => {
    // Langsung ambil data dari local storage / initial items secara sinkron & instan
    let items = getStoredItems();

    // Filter Search
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

    // Filters
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
  },

  // Ambil detail maintenance berdasarkan ID - INSTAN
  getMaintenanceById: async (id: string): Promise<MaintenanceItem | null> => {
    const items = getStoredItems();
    return items.find((item) => String(item.id) === String(id)) || null;
  },

  // Toggle Aktif / Nonaktif
  toggleMaintenanceStatus: async (id: string): Promise<boolean> => {
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
  },

  // Ambil opsi aset dengan fallback instan agar tidak stuck
  getAssetOptions: async (): Promise<AssetMaintenanceOption[]> => {
    try {
      const fetchPromise = getAssets({ per_page: 50 }).then((response) => {
        const assetList = response.data ?? [];
        if (assetList.length === 0) return fallbackAssetOptions;

        return assetList.map((asset) => {
          const fullCode = asset.asset_code?.full_code ?? `AST-${asset.id}`;
          const itemName =
            asset.asset_code?.item?.name ||
            asset.model_specification ||
            asset.brand ||
            `Aset #${asset.id}`;
          const roomLocation = asset.asset_code?.location?.name || "-";
          const locationDetail = asset.location_detail || "-";

          return {
            id: asset.id,
            fullCode,
            itemName,
            roomLocation,
            locationDetail,
            displayLabel: `${fullCode} - ${itemName}`,
          };
        });
      });

      return await withTimeout(fetchPromise, 1500, fallbackAssetOptions);
    } catch {
      return fallbackAssetOptions;
    }
  },

  // Ambil opsi petugas dengan fallback instan agar tidak stuck
  getOfficerOptions: async (): Promise<OfficerOption[]> => {
    try {
      const fetchPromise = getUsers().then((response) => {
        const users = response.data ?? [];
        const filtered = users.filter((u) => u.status_user === "Aktif");
        if (filtered.length === 0) return fallbackOfficerOptions;

        return filtered.map((u) => {
          const roleLabel = u.jabatan || u.role || "Petugas";
          return {
            id: u.id,
            name: u.nama,
            role: roleLabel,
            displayLabel: `${u.nama} (${roleLabel})`,
          };
        });
      });

      return await withTimeout(fetchPromise, 1500, fallbackOfficerOptions);
    } catch {
      return fallbackOfficerOptions;
    }
  },

  // Buat jadwal baru
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
    const dateObj = new Date(payload.scheduled_date);
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
    const formattedDate = !isNaN(dateObj.getTime())
      ? `${String(dateObj.getDate()).padStart(2, "0")} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`
      : payload.scheduled_date;

    const newItem: MaintenanceItem = {
      id: String(Date.now()),
      nomorInventaris: extraData?.fullCode || `INV-TIK-${new Date().getFullYear()}`,
      idBarang: extraData?.fullCode || `AST-TIK-${new Date().getFullYear()}-${payload.asset_id}`,
      namaBarang: extraData?.namaBarang || `Aset #${payload.asset_id}`,
      klasifikasi: "Alat IT",
      lokasi: extraData?.lokasi || "Gedung Ruangan A",
      lokasiRuangan: extraData?.lokasiRuangan || "Ruangan Default",
      jenisPemeliharaan: payload.maintenance_type || "Pembersihan & Pengecekan Rutin",
      periode: payload.period,
      tanggalJadwal: formattedDate,
      tanggalJadwalRaw: payload.scheduled_date,
      petugas: extraData?.petugasName || `Petugas #${payload.officer_id}`,
      status: "Terjadwal",
      isActive: true,
    };

    const existing = getStoredItems();
    const updated = [newItem, ...existing];
    saveStoredItems(updated);

    return newItem;
  },

  // Update jadwal yang sudah ada
  updateSchedule: async (
    id: string,
    updates: {
      jenisPemeliharaan?: string;
      periode?: string;
      tanggalJadwalRaw?: string;
      petugas?: string;
    },
  ): Promise<MaintenanceItem | null> => {
    const items = getStoredItems();
    const index = items.findIndex((item) => String(item.id) === String(id));
    if (index !== -1) {
      let formattedDate = items[index].tanggalJadwal;
      if (updates.tanggalJadwalRaw) {
        const dateObj = new Date(updates.tanggalJadwalRaw);
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
        if (!isNaN(dateObj.getTime())) {
          formattedDate = `${String(dateObj.getDate()).padStart(2, "0")} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
        }
      }

      items[index] = {
        ...items[index],
        jenisPemeliharaan: updates.jenisPemeliharaan ?? items[index].jenisPemeliharaan,
        periode: updates.periode ?? items[index].periode,
        tanggalJadwal: formattedDate,
        tanggalJadwalRaw: updates.tanggalJadwalRaw ?? items[index].tanggalJadwalRaw,
        petugas: updates.petugas ?? items[index].petugas,
      };
      saveStoredItems(items);
      return items[index];
    }
    return null;
  },
};
