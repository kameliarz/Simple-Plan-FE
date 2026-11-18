import type { ReportFilters } from "../types/report.types";

// =====================================
// DATA TYPES
// =====================================

export type Asset = {
  id: string;
  classification: string;
  status: string;
  location: string;
  condition: string;
};

export type WorkItem = {
  id: string;
  month: string;
  classification: string;
  status: string;
  group: string;
  condition: string;
  duration: number;
};

// =====================================
// HELPER
// =====================================

function expand<T>(entries: { value: T; count: number }[]): T[] {
  return entries.flatMap(({ value, count }) => Array.from({ length: count }, () => value));
}

// =====================================
// INVENTORY MOCK DATA
// =====================================

const assetClasses = expand([
  { value: "Alat IT", count: 112 },
  { value: "Alat Sarpras", count: 96 },
  { value: "Alat Medis", count: 84 },
  { value: "Alat Elektronik", count: 61 },
  { value: "Bangunan", count: 12 },
  { value: "Kendaraan", count: 10 },
  { value: "Tanah", count: 3 },
]);

const assetLocations = expand([
  { value: "IGD", count: 64 },
  { value: "Rawat Jalan", count: 55 },
  { value: "Farmasi", count: 48 },
  { value: "Radiologi", count: 33 },
  { value: "Laboratorium", count: 20 },
  { value: "Ruang Server", count: 20 },
  { value: "Lainnya", count: 138 },
]);

export const assetColors: Record<string, string> = {
  "Alat IT": "#073b88",
  "Alat Sarpras": "#0088cf",
  "Alat Medis": "#129b86",
  "Alat Elektronik": "#f4a000",
  Bangunan: "#ee7812",
  Kendaraan: "#64748b",
  Tanah: "#7c3aed",
};

const assets: Asset[] = assetClasses.map((classification, index) => ({
  id: `AST-${String(index + 1).padStart(4, "0")}`,
  classification,

  location: assetLocations[(index * 37) % assetLocations.length],

  status: index < 18 ? "Dipinjam" : index < 25 ? "Rusak" : "Tersedia",

  condition: index < 28 ? "Rusak Berat" : index < 78 ? "Rusak Ringan" : "Baik",
}));

// =====================================
// MAINTENANCE MOCK DATA
// =====================================

const maintenanceMonthlyCounts = [3, 4, 3, 4, 4, 5, 4, 7, 5, 5, 2, 2];

const maintenanceStaff = [
  "Hendra Wijaya",
  "Ahmad Fauzi",
  "Budi Santoso",
  "Rian Pratama",
  "M Hendra",
  "Bagas Santoso",
];

export const maintenanceItems: WorkItem[] = maintenanceMonthlyCounts.flatMap((count, monthIndex) =>
  Array.from({ length: count }, (_, index) => {
    const previous = maintenanceMonthlyCounts.slice(0, monthIndex).reduce((sum, n) => sum + n, 0);

    const n = previous + index;

    return {
      id: `MT-${n + 1}`,

      month: `2028-${String(monthIndex + 1).padStart(2, "0")}`,

      classification: assetClasses[(n * 7) % assetClasses.length],

      status: n < 31 ? "Selesai" : "Terjadwal",

      group: maintenanceStaff[n % maintenanceStaff.length],

      condition:
        n < 26 ? "Baik" : n < 30 ? "Rusak Ringan" : n === 30 ? "Rusak Berat" : "Belum Diperiksa",

      duration: 0,
    };
  }),
);

// =====================================
// GRAPHIC DESIGN MOCK DATA
// =====================================

const designMonthlyCounts = [10, 12, 14, 12, 15, 18, 16, 30, 27, 33, 17, 16];

const designTypes = ["Poster", "Banner", "Spanduk", "Brosur", "Undangan", "Konten Medsos"];

const designStatuses = expand([
  { value: "Baru", count: 80 },
  { value: "Ditugaskan", count: 30 },
  { value: "Menunggu Persetujuan", count: 25 },
  { value: "Perlu Revisi", count: 23 },
  { value: "Selesai", count: 31 },
  { value: "Ditolak", count: 31 },
]);

export const designStatusColors: Record<string, string> = {
  Baru: "#D0D1D3",
  Ditugaskan: "#F59E0B",
  "Menunggu Persetujuan": "#0D47A1",
  "Perlu Revisi": "#C2410C",
  Selesai: "#10B981",
  Ditolak: "#DC2626",
};

export const designItems: WorkItem[] = designMonthlyCounts.flatMap((count, monthIndex) =>
  Array.from({ length: count }, (_, index) => {
    const previous = designMonthlyCounts.slice(0, monthIndex).reduce((sum, n) => sum + n, 0);

    const n = previous + index;

    return {
      id: `DG-${n + 1}`,

      month: `2028-${String(monthIndex + 1).padStart(2, "0")}`,

      classification: "",

      status: designStatuses[(n * 37) % designStatuses.length],

      group: designTypes[n % designTypes.length],

      condition: "",

      duration: n % 2 === 0 ? 2 : 4,
    };
  }),
);

// =====================================
// FILTER INVENTORY
// =====================================

export function getInventoryAssets(filters: ReportFilters): Asset[] {
  return assets.filter((asset) => {
    if (filters.classification !== "all" && asset.classification !== filters.classification) {
      return false;
    }

    if (filters.status !== "all" && asset.status !== filters.status) {
      return false;
    }

    if (filters.location !== "all" && asset.location !== filters.location) {
      return false;
    }

    return true;
  });
}

// =====================================
// FILTER MAINTENANCE / DESIGN
// =====================================

export function getWorkItems(items: WorkItem[], filters: ReportFilters): WorkItem[] {
  return items.filter((item) => {
    if (filters.startDate && item.month < filters.startDate) {
      return false;
    }

    if (filters.endDate && item.month > filters.endDate) {
      return false;
    }

    if (
      filters.module === "maintenance" &&
      filters.classification !== "all" &&
      item.classification !== filters.classification
    ) {
      return false;
    }

    return true;
  });
}

// =====================================
// EXPORT REPORT DATA
// =====================================

export function getOtherReportRows(filters: ReportFilters): Record<string, string | number>[] {
  if (filters.module === "inventaris") {
    return getInventoryAssets(filters).map((asset) => ({
      ID: asset.id,
      Klasifikasi: asset.classification,
      Status: asset.status,
      Lokasi: asset.location,
      Kondisi: asset.condition,
    }));
  }

  if (filters.module !== "maintenance" && filters.module !== "desain-grafis") {
    return [];
  }

  const items = getWorkItems(
    filters.module === "maintenance" ? maintenanceItems : designItems,
    filters,
  );

  return items.map((item) => ({
    ID: item.id,
    Bulan: item.month,
    Klasifikasi: item.classification,
    Status: item.status,
    Kategori: item.group,
    Kondisi: item.condition,
    Durasi: item.duration,
  }));
}
