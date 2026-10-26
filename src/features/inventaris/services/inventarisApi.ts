import type {
  ApiAsset,
  AssetClassification,
  AssetCollectionResponse,
  AssetDetailResponse,
  AssetItem,
  AssetLocation,
  BulkAssetLabelExportParams,
  GetAssetsParams,
} from "../types/inventaris";
export type {
  BulkAssetLabelExportParams,
  BulkAssetLabelFilters,
  BulkAssetLabelSelectionMode,
} from "../types/inventaris";
import { clearAuth, getToken } from "@/features/auth-login/services/authStorage";

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
  if (params.moved_last_3_months) query.set("moved_last_3_months", "true");

  const queryString = query.toString();
  const url = queryString ? `${API_BASE_URL}/assets?${queryString}` : `${API_BASE_URL}/assets`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
      throw new Error("Sesi Anda telah berakhir (401). Silakan login kembali.");
    }
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
    if (response.status === 401) {
      clearAuth();
      throw new Error("Sesi Anda telah berakhir (401). Silakan login kembali.");
    }
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

export async function exportBulkAssetLabels(
  params: BulkAssetLabelExportParams | number[],
  fallbackWidthMm = 70,
  fallbackHeightMm = 35,
): Promise<void> {
  let bodyPayload: Record<string, unknown>;

  if (Array.isArray(params)) {
    bodyPayload = {
      selection_mode: "selected",
      asset_ids: params,
      width_mm: fallbackWidthMm,
      height_mm: fallbackHeightMm,
    };
  } else if (params.selection_mode === "all_filtered") {
    // Pastikan filters hanya berisi nilai yang terdefinisi
    const cleanedFilters: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(params.filters || {})) {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== "Semua status" &&
        value !== "Semua lokasi" &&
        value !== "Semua jenis" &&
        value !== "Semua kondisi"
      ) {
        cleanedFilters[key] = value;
      }
    }

    bodyPayload = {
      selection_mode: "all_filtered",
      filters: cleanedFilters,
      width_mm: params.width_mm ?? fallbackWidthMm,
      height_mm: params.height_mm ?? fallbackHeightMm,
    };
  } else {
    bodyPayload = {
      selection_mode: "selected",
      asset_ids: params.asset_ids,
      width_mm: params.width_mm ?? fallbackWidthMm,
      height_mm: params.height_mm ?? fallbackHeightMm,
    };
  }

  const response = await fetch(`${API_BASE_URL}/asset-label-exports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/pdf",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
      throw new Error("Sesi Anda telah berakhir (401). Silakan login kembali.");
    }
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Gagal mengunduh label massal (${response.status})`);
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = `asset-labels-massal-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    window.URL.revokeObjectURL(downloadUrl);
    if (document.body.contains(a)) {
      document.body.removeChild(a);
    }
  }, 1000);
}

export async function downloadSingleAssetLabel(
  assetId: number | string,
  widthMm = 70,
  heightMm = 35,
  assetUid?: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/assets/${assetId}/label?format=pdf&width_mm=${widthMm}&height_mm=${heightMm}`,
    {
      method: "GET",
      headers: {
        Accept: "application/pdf",
        Authorization: `Bearer ${getToken()}`,
      },
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
      throw new Error("Sesi Anda telah berakhir (401). Silakan login kembali.");
    }
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Gagal mengunduh label (${response.status})`);
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = `asset-label-${assetUid || assetId}.pdf`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    window.URL.revokeObjectURL(downloadUrl);
    if (document.body.contains(a)) {
      document.body.removeChild(a);
    }
  }, 1000);
}

export async function printSingleAssetLabel(
  assetId: number | string,
  widthMm = 70,
  heightMm = 35,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/assets/${assetId}/label?format=html&width_mm=${widthMm}&height_mm=${heightMm}`,
    {
      method: "GET",
      headers: {
        Accept: "text/html",
        Authorization: `Bearer ${getToken()}`,
      },
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
      throw new Error("Sesi Anda telah berakhir (401). Silakan login kembali.");
    }
    throw new Error(`Gagal memuat template cetak label (${response.status})`);
  }

  const html = await response.text();

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  iframe.style.top = "-9999px";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    throw new Error("Gagal menginisialisasi dialog cetak");
  }

  doc.open();
  doc.write(html);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2000);
  }, 500);
}
