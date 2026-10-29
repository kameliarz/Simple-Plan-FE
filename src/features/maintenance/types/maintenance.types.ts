export type MaintenanceStatus = "Terlambat" | "Terjadwal" | "Selesai";

export interface HasilMaintenance {
  uraianPekerjaan: string;
  hasilPemeliharaan: string;
  kondisiPasca: "Baik" | "Rusak Ringan" | "Rusak Berat";
  waktuMulai: string;
  waktuSelesai: string;
  fotoHasil?: {
    namaFile: string;
    ukuranFile: string;
    url?: string;
  };
}

export interface MaintenanceItem {
  id: string;
  nomorInventaris: string;
  idBarang?: string;
  namaBarang: string;
  klasifikasi?: string;
  lokasi?: string;
  lokasiRuangan?: string;
  jenisPemeliharaan?: string;
  periode: string;
  tanggalJadwal: string;
  tanggalJadwalRaw?: string;
  petugas: string;
  status: MaintenanceStatus;
  isActive: boolean;
  hasilMaintenance?: HasilMaintenance | null;
}

export interface MaintenanceFormState {
  assetId: string;
  nomorInventaris?: string;
  namaBarang: string;
  lokasiRuangan: string;
  lokasi: string;
  jenisPemeliharaan: string;
  periode: string;
  tanggalJadwal: string;
  petugasId: string;
}

export interface AssetMaintenanceOption {
  id: number;
  fullCode: string;
  itemName: string;
  roomLocation: string;
  locationDetail: string;
  displayLabel: string;
}

export interface OfficerOption {
  id: number;
  name: string;
  role: string;
  displayLabel: string;
}

export interface MaintenancePeriodOption {
  label: string;
  value: string;
}

export interface CreateMaintenanceSchedulePayload {
  asset_id: number;
  maintenance_type?: string;
  period: string;
  scheduled_date: string;
  officer_id: number;
}

export interface MaintenanceFilterState {
  klasifikasi: string;
  lokasiRuangan: string;
  petugas: string;
  status: string;
  rentangJadwal: string;
}
