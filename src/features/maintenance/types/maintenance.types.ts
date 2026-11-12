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
  assetCodeId?: number;
  nomorInventaris: string;
  idBarang?: string;
  namaBarang: string;
  klasifikasi?: string;
  lokasi?: string;
  lokasiRuangan?: string;
  jenisPemeliharaan?: string;
  periode: string;
  periodeRaw?: string;
  tanggalJadwal: string;
  tanggalJadwalRaw?: string;
  petugas: string;
  petugasId?: number | string;
  status: MaintenanceStatus;
  isActive: boolean;
  hasilMaintenance?: HasilMaintenance | null;
}

export interface MaintenanceFormState {
  assetId: string;
  assetCodeId?: number;
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
  assetCodeId: number;
  fullCode: string;
  itemName: string;
  roomLocation: string;
  locationDetail: string;
  displayLabel: string;
  classificationName?: string;
  isTik?: boolean;
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
  asset_code_id?: number;
  asset_id?: number;
  maintenance_type?: string;
  period: string;
  next_scheduled_date?: string;
  scheduled_date?: string;
  assigned_officer_id?: number;
  officer_id?: number;
}

export interface UpdateMaintenanceSchedulePayload {
  maintenance_type?: string;
  period?: string;
  next_scheduled_date?: string;
  scheduled_date?: string;
  assigned_officer_id?: number;
  is_active?: boolean;
}

export interface MaintenanceFilterState {
  klasifikasi: string;
  lokasiRuangan: string;
  petugas: string;
  status: string;
  rentangJadwal: string;
}

// Backend API response models
export interface ApiMaintenanceItem {
  id: number;
  asset_code_id: number;
  assigned_officer_id: number;
  creator_id?: number;
  maintenance_type: string;
  period: string;
  next_scheduled_date: string;
  status: string | { value: string };
  is_active: boolean;
  asset_code?: {
    id: number;
    full_code: string;
    asset_item?: { id: number; name: string };
    item?: { id: number; name: string };
    classification?: { id: number; name: string };
    location?: { id: number; name: string };
  } | null;
  assigned_officer?: {
    id: number;
    name: string;
    roles?: Array<{ id: number; name: string }>;
  } | null;
  creator?: {
    id: number;
    name: string;
  } | null;
  logs?: Array<{
    id: number;
    scheduled_date: string;
    work_description?: string | null;
    maintenance_result?: string | null;
    post_maintenance_condition?: "Baik" | "Rusak Ringan" | "Rusak Berat" | null;
    started_at?: string | null;
    completed_at?: string | null;
    proof_photo_object_key?: string | null;
    photo_path?: string | null;
    proof_photo_original_name?: string | null;
    proof_photo_mime_type?: string | null;
    proof_photo_size?: number | null;
    proof_photo_url?: string | null;
  }>;
}

export interface ApiMaintenanceCollectionResponse {
  data: ApiMaintenanceItem[];
  current_page?: number;
  last_page?: number;
  total?: number;
}
