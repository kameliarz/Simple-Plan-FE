import { getToken } from "@/features/auth-login/services/authStorage";

function authHeaders(): HeadersInit {
  const token = getToken();

  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: authHeaders(),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Gagal memuat data: HTTP ${response.status}`);
  }

  return response.json();
}

type PaginatedResponse<T> = {
  data: T[];
  last_page?: number; // Pagination lokasi dan master
  meta?: {
    last_page?: number; // Pagination /assets
  };
};

// ==========================================
// HELPER PAGINATION
// Mengambil seluruh halaman dari API.
// ==========================================

async function getAllPages<T>(
  path: string,
  params: URLSearchParams = new URLSearchParams(),
  signal?: AbortSignal,
): Promise<T[]> {
  const records: T[] = [];
  let page = 1;

  while (true) {
    signal?.throwIfAborted();

    const query = new URLSearchParams(params);

    query.set("per_page", "100");
    query.set("page", String(page));

    const result = (await getJson(`${path}?${query.toString()}`, signal)) as PaginatedResponse<T>;

    if (!result || !Array.isArray(result.data)) {
      throw new Error("Format data dari server tidak valid.");
    }

    records.push(...result.data);

    const lastPage = result.meta?.last_page ?? result.last_page ?? 1;

    if (!Number.isSafeInteger(lastPage) || lastPage < 1) {
      throw new Error("Informasi pagination dari server tidak valid.");
    }

    if (page >= lastPage) {
      break;
    }

    page += 1;
  }

  return records;
}

// ==========================================
// SEARCH USERS
// Dipertahankan untuk ReporterSection.
// ==========================================

export interface SearchedUser {
  id: number;
  name: string;
  unit: {
    id: number;
    unit_name: string;
  } | null;
}

export async function searchUsersByName(name: string): Promise<SearchedUser[]> {
  const query = new URLSearchParams({ name });

  const result = (await getJson(`/api/v1/users/search?${query}`)) as {
    data?: SearchedUser[];
  };

  return Array.isArray(result.data) ? result.data : [];
}

// ==========================================
// API SEARCH LAMA
// Tetap diekspor demi kompatibilitas.
// Tidak dipakai oleh InventorySection.
// ==========================================

export interface SearchedAsset {
  id: number;
  asset_number: string;
  name: string;
  location?: string;
  unit_id?: number;
}

export async function searchAssets(
  unitId: number | string,
  searchKeyword = "",
): Promise<SearchedAsset[]> {
  const params = new URLSearchParams({
    unit: String(unitId),
    ...(searchKeyword ? { search: searchKeyword } : {}),
  });

  const result = await getJson(`/api/v1/assets/search?${params}`);

  if (Array.isArray(result)) {
    return result as SearchedAsset[];
  }

  if (result && typeof result === "object" && "data" in result) {
    const data = result.data;

    return Array.isArray(data) ? (data as SearchedAsset[]) : [];
  }

  return [];
}

export interface SearchedUnit {
  id: number;
  unit_name: string;
}

export async function searchUnits(searchKeyword = ""): Promise<SearchedUnit[]> {
  const params = new URLSearchParams(searchKeyword ? { search: searchKeyword } : {});

  const query = params.toString();

  const result = await getJson(`/api/v1/units/search${query ? `?${query}` : ""}`);

  if (Array.isArray(result)) {
    return result as SearchedUnit[];
  }

  if (result && typeof result === "object" && "data" in result) {
    const data = result.data;

    return Array.isArray(data) ? (data as SearchedUnit[]) : [];
  }

  return [];
}

// ==========================================
// LOKASI INVENTARIS - API BARU
// GET /api/v1/asset-locations
// Mengambil seluruh halaman.
// ==========================================

export interface AssetLocation {
  id: number;
  code: number;
  name: string;
}

export async function getAssetLocations(signal?: AbortSignal): Promise<AssetLocation[]> {
  return getAllPages<AssetLocation>("/api/v1/asset-locations", undefined, signal);
}

// Alias lama untuk kompatibilitas.
// Menggunakan type alias agar tidak memicu
// @typescript-eslint/no-empty-object-type.

export type SearchedAssetLocation = AssetLocation;

export async function searchAssetLocations(searchKeyword = ""): Promise<SearchedAssetLocation[]> {
  const params = new URLSearchParams();

  if (searchKeyword.trim()) {
    params.set("search", searchKeyword.trim());
  }

  return getAllPages<SearchedAssetLocation>("/api/v1/asset-locations", params);
}

// ==========================================
// ASET FISIK - API BARU
//
// GET /api/v1/assets
// ?asset_location_id=...
// &asset_item_id=...
//
// Mengambil seluruh halaman agar opsi
// dropdown inventaris lengkap.
// ==========================================

export interface AssetReference {
  id: number;
  code: number;
  name: string;
}

export interface ListedAsset {
  id: number; // ID untuk POST /tickets -> asset_id
  asset_uid: string;
  asset_code: {
    id: number;
    full_code: string;
    sequence_number: number;
    classification: AssetReference | null;
    location: AssetReference | null;
    item:
      | (AssetReference & {
          asset_classification_id?: number;
        })
      | null;
  } | null;
  detail_item?: string | null;
  brand?: string | null;
  model_specification?: string | null;
  location_detail?: string | null;
  status?: string | null;
}

export interface GetAssetsFilters {
  assetLocationId: number;
  assetItemId?: number;
  search?: string;
}

export async function getAssets(
  filters: GetAssetsFilters,
  signal?: AbortSignal,
): Promise<ListedAsset[]> {
  const params = new URLSearchParams({
    asset_location_id: String(filters.assetLocationId),
  });

  if (filters.assetItemId != null) {
    params.set("asset_item_id", String(filters.assetItemId));
  }

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  return getAllPages<ListedAsset>("/api/v1/assets", params, signal);
}

// ==========================================
// SCAN QR / UID
// Dipertahankan.
// ==========================================

export interface AssetByUid {
  id: number;
  uid: string;
  code: string | null;
  name: string;
  brand: string;
  location: string;
}

export async function getAssetByUid(uid: string): Promise<AssetByUid> {
  const cleaned = uid.trim();

  if (!cleaned) {
    throw new Error("UID inventaris tidak valid.");
  }

  const response = await fetch(`/api/v1/assets/uid/${encodeURIComponent(cleaned)}`, {
    method: "GET",
    credentials: "include",
    headers: authHeaders(),
  });

  if (response.status === 404) {
    throw new Error("Perangkat tidak ditemukan. Periksa QR Code yang dipindai.");
  }

  if (!response.ok) {
    throw new Error(`Gagal mengambil data inventaris: HTTP ${response.status}`);
  }

  const result = (await response.json()) as {
    data?: AssetByUid;
  };

  if (
    !result.data ||
    !Number.isSafeInteger(result.data.id) ||
    result.data.id <= 0 ||
    !result.data.uid
  ) {
    throw new Error("Data inventaris dari server tidak valid.");
  }

  return result.data;
}

// ==========================================
// CREATE HELPDESK TICKET
// Dipertahankan.
// ==========================================

export type TicketService = "tik" | "sarpras";

export interface CreateTicketPayload {
  reporter_id?: number | null;
  service: TicketService;
  asset_id?: number | null;
  description: string;
  initial_evidence?: File | null;
}

export interface CreateTicketResponse {
  message?: string;
  data?: {
    id: number;
    ticket_number?: string;
    status?: string;
    [key: string]: unknown;
  };
}

export async function createTicket(payload: CreateTicketPayload): Promise<CreateTicketResponse> {
  const formData = new FormData();

  if (payload.reporter_id != null) {
    formData.append("reporter_id", String(payload.reporter_id));
  }

  formData.append("service", payload.service);

  if (payload.asset_id != null) {
    formData.append("asset_id", String(payload.asset_id));
  }

  formData.append("description", payload.description.trim());

  if (payload.initial_evidence instanceof File) {
    formData.append("initial_evidence", payload.initial_evidence);
  }

  const response = await fetch("/api/v1/tickets", {
    method: "POST",
    credentials: "include",
    headers: authHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Create ticket error:", response.status, errorText);

    throw new Error(`Gagal membuat tiket: HTTP ${response.status}`);
  }

  return (await response.json()) as CreateTicketResponse;
}
