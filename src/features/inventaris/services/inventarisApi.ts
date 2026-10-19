import type {
  ApiAsset,
  AssetClassification,
  AssetCollectionResponse,
  AssetDetailResponse,
  AssetItem,
  AssetLocation,
  GetAssetsParams,
} from "../types/inventaris";
import { getToken } from "@/features/auth-login/services/authStorage";

const API_BASE_URL = "/api/v1";

function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getAssets(params: GetAssetsParams = {}): Promise<AssetCollectionResponse> {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));
  if (params.search) query.set("search", params.search);
  if (params.asset_classification_id)
    query.set("asset_classification_id", String(params.asset_classification_id));
  if (params.classification_id) query.set("classification_id", String(params.classification_id));
  if (params.asset_location_id) query.set("asset_location_id", String(params.asset_location_id));
  if (params.location_id) query.set("location_id", String(params.location_id));
  if (params.asset_item_id) query.set("asset_item_id", String(params.asset_item_id));
  if (params.item_id) query.set("item_id", String(params.item_id));
  if (params.status && params.status !== "Semua status") query.set("status", params.status);
  if (params.condition && params.condition !== "Semua kondisi")
    query.set("condition", params.condition);
  if (params.purchase_year) query.set("purchase_year", String(params.purchase_year));

  const queryString = query.toString();
  const url = queryString ? `${API_BASE_URL}/assets?${queryString}` : `${API_BASE_URL}/assets`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil data aset (${response.status})`);
  }

  return response.json();
}

export async function getAssetDetail(id: number | string): Promise<ApiAsset> {
  const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil detail aset (${response.status})`);
  }

  const result: AssetDetailResponse = await response.json();
  return result.data;
}

export async function getAssetClassifications(): Promise<AssetClassification[]> {
  const response = await fetch(`${API_BASE_URL}/asset-classifications`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil data klasifikasi (${response.status})`);
  }

  const result = await response.json();
  return result.data || [];
}

export async function getAssetLocations(): Promise<AssetLocation[]> {
  const response = await fetch(`${API_BASE_URL}/asset-locations`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil data lokasi (${response.status})`);
  }

  const result = await response.json();
  return result.data || [];
}

export async function getAssetItems(): Promise<AssetItem[]> {
  const response = await fetch(`${API_BASE_URL}/asset-items`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil data jenis barang (${response.status})`);
  }

  const result = await response.json();
  return result.data || [];
}

export async function deleteAsset(id: number | string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Gagal menghapus aset (${response.status})`);
  }
}

export async function createAsset(payload: FormData | Record<string, unknown>): Promise<ApiAsset> {
  const isFormData = payload instanceof FormData;
  const headers: HeadersInit = {
    Accept: "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
  if (!isFormData) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}/assets`, {
    method: "POST",
    headers,
    body: isFormData ? payload : JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Gagal menambah aset (${response.status})`);
  }

  const result: AssetDetailResponse = await response.json();
  return result.data;
}

export async function updateAsset(
  id: number | string,
  payload: FormData | Record<string, unknown>,
): Promise<ApiAsset> {
  const isFormData = payload instanceof FormData;
  const headers: HeadersInit = {
    Accept: "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
  if (!isFormData) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
    method: "POST",
    headers,
    body: isFormData ? payload : JSON.stringify({ ...payload, _method: "PUT" }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Gagal mengubah data aset (${response.status})`);
  }

  const result: AssetDetailResponse = await response.json();
  return result.data;
}
