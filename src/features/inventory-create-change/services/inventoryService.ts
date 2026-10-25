import { apiGet, apiPost, apiPostJson } from "./api";
import type { FormState, InventoryStatus, InventoryCondition } from "../types/inventory.types";

export interface AssetClassification {
  id: number;
  code: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AssetLocation {
  id: number;
  code: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AssetItem {
  id: number;
  code: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
}

export interface AssetDetail {
  id: number;
  asset_uid: string;

  asset_code: {
    id: number;
    full_code: string;
    sequence_number: number;

    classification: AssetClassification;
    location: AssetLocation;
    item: AssetItem;
  };

  detail_item: string | null;
  serial_number: string | null;
  brand: string | null;
  model_specification: string | null;
  location_detail: string | null;
  purchase_year: number;

  status: string;
  condition: string;

  warranty_until: string | null;
  notes: string | null;
  photo: string | null;
  calibration_document: string | null;

  created_at: string;
  updated_at: string;
}

interface AssetDetailResponse {
  data: AssetDetail;
}

export const inventoryService = {
  getClassifications: async (): Promise<AssetClassification[]> => {
    const response = await apiGet<PaginatedResponse<AssetClassification>>("/asset-classifications");

    return response.data;
  },

  getLocations: async (): Promise<AssetLocation[]> => {
    const response = await apiGet<PaginatedResponse<AssetLocation>>("/asset-locations");

    return response.data;
  },

  getItems: async (): Promise<AssetItem[]> => {
    const response = await apiGet<PaginatedResponse<AssetItem>>("/asset-items");

    return response.data;
  },

  createAsset: async (data: FormData) => {
    return apiPost<unknown>("/assets", data);
  },

  getAssetById: async (id: string): Promise<AssetDetail> => {
    const response = await apiGet<AssetDetailResponse>(`/assets/${encodeURIComponent(id)}`);

    return response.data;
  },

  updateAsset: async (id: string, data: FormData) => {
    return apiPost<AssetDetailResponse>(`/assets/${encodeURIComponent(id)}`, data);
  },

  createLocation: async (name: string): Promise<AssetLocation> => {
    const response = await apiPostJson<{
      data: AssetLocation;
    }>("/asset-locations", {
      name,
    });

    return response.data;
  },

  createItem: async (classificationId: number, name: string): Promise<AssetItem> => {
    const response = await apiPostJson<{
      data: AssetItem;
    }>("/asset-items", {
      asset_classification_id: classificationId,
      name,
    });

    return response.data;
  },
};

const statusMap: Record<string, InventoryStatus> = {
  Digunakan: "digunakan",
  "Tidak Digunakan": "tidak-digunakan",
  Rusak: "rusak",
  Dipinjam: "dipinjam",
};

const conditionMap: Record<string, InventoryCondition> = {
  Baik: "baik",
  "Rusak Ringan": "rusak-ringan",
  "Rusak Berat": "rusak-berat",
};

export function mapAssetToForm(asset: AssetDetail): FormState {
  const status = statusMap[asset.status];
  const condition = conditionMap[asset.condition];

  if (!status || !condition) {
    throw new Error(`Status atau kondisi tidak dikenali: ${asset.status} / ${asset.condition}`);
  }

  return {
    classification: String(asset.asset_code.classification.id),
    roomLocation: String(asset.asset_code.location.id),
    itemName: String(asset.asset_code.item.id),
    detailItem: asset.detail_item ?? "",
    location: asset.location_detail ?? "",
    model: asset.model_specification ?? "",
    serialNumber: asset.serial_number ?? "",
    purchaseYear: String(asset.purchase_year),
    warrantyUntil: asset.warranty_until?.slice(0, 10) ?? "",
    description: asset.notes ?? "",
    status,
    condition,
  };
}

const statusApiMap: Record<InventoryStatus, string> = {
  digunakan: "Digunakan",
  "tidak-digunakan": "Tidak Digunakan",
  rusak: "Rusak",
  dipinjam: "Dipinjam",
};

const conditionApiMap: Record<InventoryCondition, string> = {
  baik: "Baik",
  "rusak-ringan": "Rusak Ringan",
  "rusak-berat": "Rusak Berat",
};

export function mapFormToUpdateAsset(form: FormState, classificationId?: string): FormData {
  const formData = new FormData();

  // Laravel method spoofing
  formData.append("_method", "PUT");

  // Relasi aset
  formData.append("asset_classification_id", classificationId || form.classification);
  formData.append("asset_location_id", form.roomLocation);
  formData.append("asset_item_id", form.itemName);

  // Detail aset
  formData.append("purchase_year", form.purchaseYear);
  formData.append("serial_number", form.serialNumber.trim());
  formData.append("model_specification", form.model.trim());
  formData.append("location_detail", form.location.trim());

  // Status dan kondisi
  formData.append("status", statusApiMap[form.status]);
  formData.append("condition", conditionApiMap[form.condition]);

  // Field opsional
  formData.append("warranty_until", form.warrantyUntil || "");
  formData.append("notes", form.description.trim());

  return formData;
}
