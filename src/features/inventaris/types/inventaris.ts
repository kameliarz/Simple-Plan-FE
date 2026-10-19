export type InventarisStatus = "Digunakan" | "Tidak Digunakan" | "Dipinjam" | "Rusak" | "Aktif";
export type InventarisCondition = "Baik" | "Rusak Ringan" | "Rusak Berat";

export interface AssetClassification {
  id: number;
  code: number;
  name: string;
}

export interface AssetLocation {
  id: number;
  code: number;
  name: string;
}

export interface AssetItem {
  id: number;
  code: number;
  name: string;
}

export interface AssetCodeInfo {
  id: number;
  full_code: string;
  sequence_number: number;
  classification?: AssetClassification | null;
  location?: AssetLocation | null;
  item?: AssetItem | null;
}

export interface AssetFileInfo {
  original_name: string;
  mime_type: string;
  size: number;
  url?: string | null;
}

export interface AssetHistoryInfo {
  id: number;
  event_type: string;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  is_location_change?: boolean;
  created_at: string;
  changed_by?: {
    id: number;
    name: string;
  } | null;
}

export interface ApiAsset {
  id: number;
  asset_uid: string;
  asset_code?: AssetCodeInfo | null;
  serial_number?: string | null;
  brand?: string | null;
  model_specification?: string | null;
  location_detail?: string | null;
  purchase_year: number;
  status: InventarisStatus;
  condition: InventarisCondition;
  warranty_until?: string | null;
  notes?: string | null;
  photo?: AssetFileInfo | null;
  calibration_document?: AssetFileInfo | null;
  histories?: AssetHistoryInfo[];
  created_at?: string;
  updated_at?: string;
}

export interface GetAssetsParams {
  page?: number;
  per_page?: number;
  search?: string;
  asset_classification_id?: number | string;
  classification_id?: number | string;
  asset_location_id?: number | string;
  location_id?: number | string;
  asset_item_id?: number | string;
  item_id?: number | string;
  status?: string;
  condition?: string;
  purchase_year?: number | string;
}

export interface AssetCollectionResponse {
  data: ApiAsset[];
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta?: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface AssetDetailResponse {
  data: ApiAsset;
  message?: string;
}
